var path = require( 'path' ),
    http = require( 'http' ),
    lib = require( './lib' ),
    fs = require( 'fs' ),
    qs = require( 'querystring' );
//    url = require( 'url '),

exports.start = start;
exports.route = route;


// parse the post here, turn into object, attach 
function _processPost(request, response, callback) 
{
    var post_data = "";
    if (typeof callback !== 'function') return null;

    if ( request.method == 'POST' ) {
        request.on('data', function(data) {
            post_data += data;
        });

        request.on('end', function() {
            callback( post_data );
        });
    } else {
        response.writeHead(405, {'Content-Type': 'text/plain'});
        response.end('405');
    }
}




function route( handler, req, res ) 
{
    //
    // analyze req & res here
    //
    var pathname = req.url;

    lib.log( "router: handling request for: \""+ pathname +'"' );

    var handlers = handler.handlers;

    // reset
    handler.config['get'] = {};
    handler.config['post'] = {};
    delete handler.config.current_handler;


    // block requests for files that match names in this list
    var basename = path.basename( pathname ).toLowerCase();
    for ( var i = 0, l = handler.config.block_list.length; i < l; i++ ) {
        if ( handler.config.block_list[i].toLowerCase() === basename ) {
            return lib.forbidden_request( res, pathname /* for logs */ );
        }
    }

    // block contents at or below these directories
    if ( pathname.split('/').some(function(dir) 
        {
            for ( var i = 0, l = handler.config.block_dirs.length; i < l; i++ ) 
                if ( handler.config.block_dirs[i] === dir ) 
                    return true;
        }) )
    {
        return lib.forbidden_request( res, pathname /* for logs */ );
    }


    // wrap the post callbacks or simply call the get responder
    function server_response( responder_func ) 
    {
        if ( req.method == 'POST' ) {
            _processPost(req, res, function( postString ) {
                handler.config.post = qs.parse( postString );
                responder_func( req, res, lib );
            });
        }
        else
            responder_func( req, res, lib );
    }


    // extract the get
    if ( pathname.indexOf( '?' ) !== -1 ) {
        var url = require('url');
        handler.config['get'] = url.parse( req.url, true ).query;
    }

    // exact match
    if ( handlers && typeof handlers[pathname] === 'function' ) {
        handler.config.current_handler = pathname;
        return server_response( handlers[pathname] );
    }

    // if pathname ends in '/', check for index.html in directory, if found, serve it
    if ( pathname[pathname.length-1] === '/' ) {
        for ( var i = 0, l = handler.config.search_list.length; i < l; i++ ) {
            var index_file = pathname + handler.config.search_list[i];
            try {
                var index_resolved = path.resolve( handler.config.static_dir + index_file );
                var stat = fs.statSync( index_resolved );
                return lib.serve_static( index_resolved, res );
            } catch(e) { 
                continue;
            }
        }
    }

    // trim off base uri, and try it: "/blog/2011/10/31" -> "/blog"
    var s = req.url ? req.url.trim() : '';

    var base_uri = s.slice(0, s.indexOf('/',1)); // get uri base only to decide handler
    if ( typeof handlers[base_uri] === 'function' ) {
        handler.config.current_handler = base_uri;
        return server_response( handlers[base_uri] );
    }

    base_uri = s.slice(0, s.indexOf('?',1));     // also slice off before '?'
    if ( typeof handlers[base_uri] === 'function' ) {
        handler.config.current_handler = base_uri;
        return server_response( handlers[base_uri] );
    }

    // didn't match handlers, try static_file uri; it will report if file not found
    lib.serve_static( req, res );
}

function start( handler, port ) 
{
    function onRequest(request, response) 
    {
        // useful for debugging
        function examine(req,res) {
            var s = lib.pobj('REQUEST',req) + "\n<br><br>\n" + lib.pobj('RESPONSE',res);
            s += "\n"+lib.pobj('SOCKET',req.socket);
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write('<pre>'+s+'</pre>');
            response.end();
            return true;
        } 
        //return examine( request, response ); 


        route( handler, request, response );
    }

    var listening_port = handler.config.port = port || 8000;
    http.createServer(onRequest).listen(listening_port);
    lib.log('Server "'+handler.config.application_name+'" started. Listening on port: ' + listening_port );
}

