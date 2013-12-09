
var path = require('path');
var server = require('./server/server.js');
var handler = require( './server/handler.js' );

//var router = require('./server/router.js'); // moved to handler

// 
//  determine which app 
// 

// default app: "Hello World"
if ( process.argv.length < 3 ) {
    var app_name = "_default"; // built-in "hello world" project
    var port = 80;
}
else
{
    var app_name = process.argv[2];
    var port = parseInt( ((process.argv.length >= 4) ? process.argv[3] : 80), 10 );
}

//
//  setup handler
//
handler.setup( app_name ); // looks in app_name/config.js for handler.config path

//server.setApplication( app_name, path.resolve(__dirname) /* here */ );
server.setHandler( handler );
server.setPort( port );
server.start();



/* this stuff all happens in handler.js now
var handlers = {};
handlers["/"]           = requestHandler.root;
handlers["/upload"]     = requestHandler.upload;

// and this happens in server.start
server.start( router.route, handlers );
*/

