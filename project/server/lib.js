// lib.js

var fs = require('fs');
var mime = require('./mime.js');
var Stream = require('stream');

// lib.config - application internal settings 
var config = {
    static_dir: 'static-includes',
    logFileName: './node-server-log.txt',
    server_static_dir: 'static-includes'
};

exports.pobj = pobj;
exports.type_of = type_of;
exports.default_config = config;
exports.log = log;
exports.serve_static = serve_static;
exports.reportError = reportError;
exports.dir_listing = dir_listing;

// function names beginning with underscore not exported
function _obj_keys(m) {
    var s = '';
    for ( i in m ) {
        if ( m.hasOwnProperty( i ) ) {
            s += i + ': ' + m[i] + "\n";
        }
    }
    return s;
}

//print object
function pobj( name_or_obj, obj )
{
    if ( arguments.length > 1 )
    {
        this.name = name_or_obj;
        this.obj = obj;
    }
    else if ( arguments.length === 1 )
    {
        this.name = '';
        this.obj = name_or_obj;
    }
    else
        return undefined;

    var s = this.name + ' ['+ typeof(this.obj) + ']: ';
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
    if ( !log.started )
        late_start();

    // write
    if ( arguments.length > 0 ) {
        var args = Array.prototype.slice.call(arguments);
        var date = (new Date()).toUTCString();
        var msg = date +' - '+ log.prefix + args.join(' ').trim() + "\n";
        log.write( msg );
        //log.print( msg );
    }

    function late_start() {
        log.started = true;
        log.writeStdout = true;
        log.prefix = 'Log: ';
        //log.print = function(s) { process.stdout.write(s); };
        log.fileOutStream = fs.createWriteStream( config.logFileName );
        log.stream = new Stream();
        log.pipe_func = function(data) {
            this.fileOutStream.write( data );
            if ( this.writeStdout )
                process.stdout.write( data );
        };
        log.stream.on( 'data', log.pipe_func.bind(log) );
        log.write = function( msg ) { this.stream.emit( 'data', msg ); };
    }
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

function serve_static( req, res )
{
    var path = require('path'),
        fs = require('fs');

    var file = ( type_of(req) === 'string' ) ? req : req.url;

    if ( file[0] !== '/' )
        file = '/' + file;

debugger;
    var ap_file = path.normalize( config.static_dir + file );
    log('Serving static file: "'+ap_file+'"');
    try {
        var stat = fs.statSync( ap_file );
        if (stat.isDirectory()) {
            res.writeHead(403); 
            res.end('Forbidden');
            return;
        } 

        // is ok, serve it
        return serve_file( ap_file, res );

    } catch(e) {
        var serv_file = path.normalize( config.server_static_dir + file );
        log('Trying server static file: "'+serv_file+'"');
        try { 
            stat = fs.statSync( serv_file );
            if (stat.isDirectory()) {
                res.writeHead(403); 
                res.end('Forbidden');
                return;
            } 

            // serve it!
            return serve_file( serv_file, res );

        } catch(e) {
            log( '"'+file+'" sending 404, File not found' );
            res.writeHead(404);
            res.end('"'+file+'" Not found on this server');
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

