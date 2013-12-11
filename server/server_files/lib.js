// lib.js

var mime = require('./mime.js'),
    Stream = require('stream'),
    path = require('path'),
    http = require('http'),
    fs = require('fs');


// lib.config - application internal settings 
var config = 
{
    // just a place-holder. Usually set to the project directory unless custom set by the project.
    static_dir: 'static-includes',

    // can be anything
    logFileName: './node-server-log.txt',

    // name of folder in server_files which holds static files which might be applicable to any project 
    //  (eg. jquery.js)
    server_static_dir: 'static-includes',

    // list of default files to serve via a directory request, in order. Every server has one of these.
    search_list: ['index.html','index.htm','index.js','default.html'],

    // filenames which won't be served under any circumstances, from any directory
    block_list: ['config.js'],

    // block anything contained in these directories and their sub-directories
    block_dirs: [] 
};


// called by handler after config is finished being built
function late_inits() 
{
    //
    // block serving the log file
    //
    config.block_list.push(config.logFileName.substring(config.logFileName.lastIndexOf('/')+1));

    //
    // get listing of static_dir and block any paths containing directories starting with '.'
    //
    var files = dir_listing( config.static_dir );

    // for each file of the static files directory
    files.forEach( function(file) {
        // for each segments of the file path
        file.split('/').forEach( function(seg) {
            // if the segment begins with '.' && isn't already in config
            if ( seg[0] === '.' && !config.block_dirs.some(function(elt){ return elt === seg }) )
                // put it there
                config.block_dirs.push( seg );
        } );
    } );

    //
    // start the logger
    //
    log.start();
}

exports.pobj = pobj;
exports.type_of = type_of;
exports.config = config;
exports.log = log;
exports.serve_static = serve_static;
exports.reportError = reportError;
exports.dir_listing = dir_listing;
exports.forbidden_request = forbidden_request;
exports.boilerplate = boilerplate;
exports.late_inits = late_inits;
exports.split_url = split_url;
exports.get_url = get_url;
exports.replace_tags = replace_tags;

// function names beginning with underscore not exported
function _obj_keys( obj, level ) {
    var s = '';
    for ( var key in obj ) {
        if ( obj.hasOwnProperty( key ) ) {
            var value = '';
            switch (type_of(obj[key])) {
            case 'function':
                value = 'function '+obj[key].name+'()';
                break;
            case 'object':
                if ( !level || level < 2 ) {
                    value = '{ '+ _obj_keys( obj[key], (level||0) + 1 ) + ' }';
                    break;
                }
                // fall-through
            default: 
                try {
                    value = JSON.stringify(obj[key]);
                } catch(e) {
                    value = obj[key].toString();
                }
            }
            var padding = level ? '  ' : '';
            s += padding + key + ': ' + value + "\n";
        }
    }
    return s;
}

//print object
function pobj( name_or_obj, obj )
{
    if ( arguments.length > 1 )
    {
        this.name = name_or_obj + ' [';
        this.obj = obj;
    }
    else if ( arguments.length === 1 )
    {
        this.name = '[';
        this.obj = name_or_obj;
    }
    else
        return undefined;

    var s = this.name + typeof(this.obj) + ']: ' + "\n";
    s += _obj_keys(this.obj);

    return s;
}

function type_of( t ) {
    var s = typeof t;
    switch( s ) {
    case "object":
        if ( t instanceof Date ) {
            return "date";
        }
        else if ( t instanceof Array ) {
            return "array";
        }
        else if ( t instanceof RegExp ) {
            return "regexp";
        }
    default:
        return s;
    }
}

function log() 
{
    // write
    if ( arguments.length > 0 ) {
        var args = Array.prototype.slice.call(arguments);
        var date = (new Date()).toUTCString();
        var msg = date +' - '+ log.prefix + args.join(' ').trim() + "\n";
        log.write( msg );
    }
}
log.start = function () {
    log.started = true;
    log.writeStdout = true;
    log.prefix = 'Log: ';
    log.fileOutStream = fs.createWriteStream( config.logFileName, {flags:'a'} );
    log.stream = new Stream();
    log.pipe_func = function(data) {
        this.fileOutStream.write( data );
        if ( this.writeStdout )
            process.stdout.write( data );
    };
    log.stream.on( 'data', log.pipe_func.bind(log) );
    log.write = function( msg ) { this.stream.emit( 'data', msg ); };
    log( "*** LOG STARTED ***" );
}


function _mime_from_suffix( file )
{
    var suf = file.slice( file.lastIndexOf('.') );
    return mime.find( suf );
}

function reportError(res,err) {
    log(err);
    res.writeHead(500);
    res.end('Internal Server Error');
}

function forbidden_request( res, filename ) {
    log( '403 Forbidden request for: "'+filename+'"' );
    res.writeHead(403);
    res.end( arguments.length > 2 ? arguments[2] : 'Forbidden' );
    return;
}

function serve_static( req, res )
{
    var path = require('path'),
        fs = require('fs');

    var file = ( type_of(req) === 'string' ) ? req : req.url;

    if ( file[0] !== '/' )
        file = '/' + file;

    // may be resolved already (if it is we won't worry about server directory)
    if ( file.indexOf( config.static_dir ) === 0 )
        var ap_file = file;
    else
        var ap_file = path.normalize( config.static_dir + file );

    log('Serving static file: "'+ap_file+'"');
    try {
        var stat = fs.statSync( ap_file );
        if (stat.isDirectory()) {
            return forbidden_request( res, ap_file );
        } 

        // is ok, serve it
        return serve_file( ap_file, res );

    } catch(e) {
        var serv_file = path.normalize( config.server_static_dir + file );
        log('Trying server static file: "'+serv_file+'"');
        try { 
            stat = fs.statSync( serv_file );
            if (stat.isDirectory()) {
                return forbidden_request( res, serv_file );
            } 

            // serve it!
            return serve_file( serv_file, res );

        } catch(e) {
            log( '404 "'+file+'", File not found' );
            res.writeHead(404);
            res.end('"'+path.basename(file)+'" Not found on this server');
        }
    }

    function serve_file( file, res ) {
        var mime = _mime_from_suffix(file);
        var rs = fs.createReadStream(file);
        rs.on('error', reportError.bind(null,res) );
        res.writeHead(200, {"Content-Type": mime });
        rs.pipe(res);
    }

/*
    fs.exists(ap_file, function(exists) {
        if (exists) {
            fs.stat(file, function(err, stat) {
                if (err) {
                    return reportError(res,err);
                }

                if (stat.isDirectory()) {
                    res.writeHead(403); 
                    res.end('Forbidden');
                } else {
                    // determine kind of file so we can include correct headers
                }
            });
        } else {
            
            log( '"'+file+'" gives 404, File not found" );
            res.writeHead(404);
            res.end('"'+path.basename(file)+'" Not found on this server');
        }
    });
*/
}

function _ls_dir ( dir_path, set )
{
    try {
        var stat = fs.statSync( dir_path );
    } catch(e) {
        process.stderr.write( "error: \""+dir_path+'" not found' +"\n" );
        return null;
    }

    if ( !stat.isDirectory() )
        set.push( dir_path );
    else
    {  
        var dir = fs.readdirSync( dir_path );

        for ( var i = 0, l = dir.length ; i < l; i++ ) {
            dir[i] = path.resolve( dir_path, dir[i] );

            stat = fs.statSync( dir[i] );
            if ( stat.isDirectory() )
                _ls_dir( dir[i], set );
            else
                set.push( dir[i] );
        }
    }
}

function dir_listing( _dir ) {
    var set = [];
    _ls_dir( path.resolve(_dir), set );
    return set;
}

/* 
    - if just arg1 is set, that sets page title.
    - if arg1 is set and arg2 is true, page title is arg1 concatenated onto application_name 
*/
function boilerplate( which, arg1, arg2 ) 
{
    var ap_name = config.application_name ? config.application_name : 'Skeleton Server Page';
    if ( arg1 && !arg2 ) 
        ap_name = arg1;
    else if ( arg1 && arg2 )
        ap_name = ap_name + ' - ' + arg1;

    switch ( which ) 
    {
    case 'html':
        return '<!doctype html>\n<html>\n<head>\n <title>'+ap_name+'</title>\n</head>\n\n <body>\n';
    case 'title':
        return '<!doctype html>\n<html>\n<head>\n <title>'+ap_name+'</title>\n';
    case 'close':
    case 'close_html':
    case 'end':
        return ' </body>\n</html>\n';
    case 'close_head':
        return '</head>\n\n<body>\n';
    default:
    case 'head':
        return '<!doctype html>\n<html>\n<head>\n';
    }
}

// split 'http://www.domain.com/sub/directories' into-> ['http://www.domain.com','/sub/directories']
function split_url(url) 
{
    var i = 0;
    do {
        i = url.indexOf('/', i + 2);
    } while ( i !== -1 && i+2 < url.length && url[i+1] === '/' );
    return [ url.substring(0,i), url.substring(i) ];
}

function get_url( url, callback ) 
{
    var url_components = split_url(url);

    var options = {
        host: url_components[0],
        port: 80,
        path: url_components[1],
        method: "GET"
    };

    var returnstring = '';

    http.request(options, function(response) {
        response.setEncoding('utf8');
        response.on('data', function(data) {
            returnstring += data;
       });
        response.on('end',function(){
            callback(returnstring);
        });
    }).end();
}

var _tagsToReplace = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
};

function _replaceTag(tag) {
    return _tagsToReplace[tag] || tag;
}

function replace_tags(str) {
    return str.replace(/[&<>]/g, _replaceTag);
}

