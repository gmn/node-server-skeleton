// start_server.js

var path = require('path');
var server = require('./server/server.js');
var handler = require( './server/handler.js' );


// 
//  determine which app 
// 

// default app: "Hello World"
if ( process.argv.length < 3 ) {
    var app_directory = "Vanilla Node Skeleton Server"; // built-in "hello world" project
    var port = 80;
    process.stderr.write( "\n * Starting default server. Use '--help' to see options.\n\n" );
}
// print help & exit
else if ( process.argv[2] === '-h' || process.argv[2] === '--help' ) {
    var n = path.basename( process.argv[0] );
    var a = path.basename( process.argv[1] );
    console.log( 'usage: '+n+' '+a+' [application_name] [port]' );
    process.exit(0);
}
else {
    var app_directory = process.argv[2];
    var port = parseInt( ((process.argv.length >= 4) ? process.argv[3] : 80), 10 );
}

//
//  setup handler
//
handler.setApp( app_directory );

//
//  start
//
server.start( handler, port );


