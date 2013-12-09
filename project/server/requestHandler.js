var lib = require('./lib');


exports.root        = root;
exports.upload      = upload;

function root( req, res ) {
    lib.log( " in Request Handler: 'root'" );
    lib.serve_static( 'index.html', res );
}

// sample Handler
function upload( req, res ){
    lib.log(" in Request handler: 'upload'");
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write( 'Upload: /upload' );
    res.end();
}

