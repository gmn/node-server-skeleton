
var server = require('./server.js');
var router = require('./router.js');
var requestHandler = require("./requestHandler");

var handlers = {};
handlers["/"]           = requestHandler.root;
handlers["/upload"]     = requestHandler.upload;

server.start( router.route, handlers );

