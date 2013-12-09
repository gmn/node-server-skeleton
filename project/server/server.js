var http = require("http"),
    lib = require('./lib');

exports.start = start;

function start( router, handler, port ) 
{
    var listening_port = port || 8000;

    function onRequest(request, response) 
    {
        function examine(req,res) {
            var s = 'REQ:'+lib.pobj(req) + "\n<br><br>\nRES:" + lib.pobj(res);
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write('<pre>'+s+'</pre>');
            response.end();
            return true;
        }

        /*
        if ( examine(request, response) )
            return;
        */

        router( handler, request, response );
    }

    http.createServer(onRequest).listen( listening_port );
    lib.log("Server started. Listening on port: " + listening_port );
}
