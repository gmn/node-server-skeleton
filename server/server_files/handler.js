// handler.js

var fs = require('fs');
var lib = require('./lib');
var path = require('path');

// default config from lib, gets modified here, and passed to server in handler.
var config = lib.config; 

// URI which get routed to function handlers
var handlers = 
{
    '/about_node_server_skeleton' : function( req, res ) {
        var page = '<!doctype html><html><head><title>Node Server Skeleton - Hello World</title></head><body><h1>Hello World!</h1><br>Node Server Skeleton, &copy; 2013</body></html>';
        res.writeHeader( 200, { "Content-Type": 'text/html' } );
        res.write( page );
        res.end();
    }
};

// can also pass config as 2nd argument: {object}
function setup( unresolved_path )
{
    try {
        var app_path = path.resolve( unresolved_path );
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
    config['application_name'] = path.basename( app_path ); // set here. can set to something better in config.js

    // fix server_static_dir
    if ( config['server_static_dir'] ) {
        var script_name = path.basename( process.argv[1] );
        var script_dir = path.dirname( process.argv[1] );
        if ( script_name === 'debug' ) {
            script_name = path.basename( process.argv[2] );
            script_dir = path.dirname( process.argv[2] );
        }
        config['server_dir'] = script_dir + '/server_files/'; // TODO: auto-detect files_dir in case it gets changed
        config['server_static_dir'] = config['server_dir'] + config['server_static_dir'] ;
    }

    // can pass config object as optional 2nd argument  
    if ( arguments.length > 1 && lib.type_of(arguments[1]) === 'object' ) {
        var o = arguments[1];
        for ( var i in o ) {
            if ( o.hasOwnProperty(i) ) {
                config[i] = o[i];
            }
        }
    }

    // Look for config.js in the application directory. If found,
    //  set (or overwrite) config directives with ones supplied from it.
    try { 
        var app_conf_path = path.resolve( app_path, 'config.js' ) ;
        stat = fs.statSync( app_conf_path );
        var app_conf = require( app_conf_path ).config;
        for ( var key in app_conf ) {
            if ( app_conf.hasOwnProperty( key ) ) 
            {
                // concatenate arrays, adding onto, instead of overwriting, the original
                if ( lib.type_of( app_conf[key] ) === 'array' && config[key] ) {
                    config[key] = app_conf[key].concat( config[key] );
                } else {
                    switch (key) {
                    case 'static_dir': 
                        config[key] = path.resolve( app_path, app_conf[key] );
                        break;
                    default:
                        config[key] = app_conf[key];
                    }
                }
            }
        }
    } catch(e) { }

    // propagate the handlers from the config.handler field
    if ( config['handlers'] ) {
        for ( var uri in config['handlers'] ) {
            if ( config['handlers'].hasOwnProperty(uri) ) {
                handlers[uri] = config['handlers'][uri];
            }
        }
    }

    // call these after config is finished being built
    lib.late_inits();
}
exports.setup = setup;
exports.handlers = handlers;
exports.config = config;
