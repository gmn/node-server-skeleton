
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
else if ( process.argv[2] === '-h' || process.argv[2] === '--help' ) {
    console.log( 'usage: node server.js [application_name] [port]' );
    process.exit(0);
}
else {
    var app_name = process.argv[2];
    var port = parseInt( ((process.argv.length >= 4) ? process.argv[3] : 80), 10 );
}

//
//  setup handler
//
handler.setApp( app_name );

//
//  start
//
server.start( handler, port );


