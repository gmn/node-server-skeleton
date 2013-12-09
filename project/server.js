
var server = require('./server/server.js');
var router = require('./server/router.js');
var requestHandler = require("./server/requestHandler");

var handlers = {};
handlers["/"]           = requestHandler.root;
handlers["/upload"]     = requestHandler.upload;

server.start( router.route, handlers );

