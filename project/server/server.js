var http = require("http"),
    lib = require('./lib'),
    fs = require('fs'),
    path = require( 'path' );

exports.start = start;
exports.route = route;


function route( handler, req, res ) 
{
debugger;
    //
    // analyze req & res here
    //
    var pathname = req.url;

    lib.log( "router: handling request for: \""+ pathname +'"' );

    var handlers = handler.handlers;

    // exact match
    if ( handlers && typeof handlers[pathname] === 'function' ) 
        return handlers[pathname].call(lib, req, res );

    // if pathname ends in '/', check for index.html in directory, if found, serve it
    if ( pathname[pathname.length-1] === '/' ) {
        var index_file = pathname + 'index.html';
        try {
            var index_resolved = path.resolve( handler.config.static_dir + index_file );
            var stat = fs.statSync( index_resolved );
debugger;
            return lib.serve_static( index_resolved, res );
        } catch(e) { }
    }

    // trim off base uri, and try it: "/blog/2011/10/31" -> "/blog"
    var s = req.url ? req.url.trim() : '';
    var base_uri = s.slice(0, s.indexOf('/',1)); // get uri base only to decide handler

    if ( typeof handlers[base_uri] === 'function' )
        return handlers[base_uri].call(lib, req, res );

    // didn't match handlers, try static_file uri; it will report if file not found
    lib.serve_static( req, res );
}

function start( handler, port ) 
{
debugger;
    var listening_port = port || 8000;
    handler.config.port = listening_port;

    function onRequest(request, response) 
    {
        function examine(req,res) {
            var s = 'REQ:'+lib.pobj(req) + "\n<br><br>\nRES:" + lib.pobj(res);
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write('<pre>'+s+'</pre>');
            response.end();
            return true;
        }

        route( handler, request, response );
    }

    http.createServer(onRequest).listen(listening_port);
    lib.log('Server "'+handler.config.server_name+'" started. Listening on port: ' + listening_port );
}

