var lib = require('./lib');

exports.route = route;

function route( handle, req, res ) 
{
    //
    // analyze req & res here
    //
    var pathname = req.url;

    lib.log( "router: handling request for: \""+ pathname +'"' );

    // exact match
    if ( handle && typeof handle[pathname] === 'function' ) 
        return handle[pathname]( req, res );

    // trim off base uri, and try it
    var s = req.url || '';
    s = s.trim();
    var base_uri = s.slice(0, s.indexOf('/',1)); // get uri base only to decide handler

    if ( typeof handle[base_uri] === 'function' )
        return handle[base_uri]( req, res );

    // didn't match handlers, try static_file uri; it will report if file not found
    lib.serve_static( req, res );
}

