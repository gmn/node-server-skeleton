// handler.js

var fs = require('fs');
var lib = require('./lib');
var config = lib.config;
var path = require('path');


var handlers = {};

// default handler
handlers['/'] = function( req, res ) {
    var page = '<!doctype html><html><head><title>Node Server Skeleton - Hello World</title></head><body><h1>Hello World!</h1><br>Node Server Skeleton</body></html>';
    res.writeHeader( 200, { Content-Type: 'text/html' } );
    res.write( page );
    res.end();
}

function setAppDir( app_path )
{
    try {
        var stat = fs.statSync( app_path );
    } catch(e) {
        lib.log( 'Error: "' + app_path + '" does not exist' );
        process.exit(-1);
    }

    if ( !stat.isDirectory() ) {
        lib.log( 'Error: "' + app_path + '" is not a directory' );
        process.exit(-1);
    }

    config['app_path'] = app_path;
    config['static_dir'] = app_path; // config can still overwrite

    try { 
        var app_conf_path = path.resolve( app_path, 'config.js' ) ;
        stat = fs.statSync( app_conf_path );
        var app_conf = require( app_conf_path ).config;
        for ( var key in app_conf ) {
            if ( app_conf.hasOwnProperty( key ) ) {
                config[key] = app_conf[key];
            }
        }

        if ( config['request'] && config['handler'] ) {
            var hname = config['handler'];
            var hpath = path.resolve( app_path, hname ) ;
            try {
                stat = fs.statSync( hpath );
                
                for ( var uri in config['request'] ) {
                    if ( config['request'].hasOwnProperty(i) ) {
                        handlers[uri] = 
                    }
                }
            } catch(e) {}
        }
    } catch(e) { 
    }
}
exports.setApp = setAppDir;
exports.handlers = handlers;
