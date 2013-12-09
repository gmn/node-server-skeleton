
if ( process.argv.length < 3 )
    console.log("no dir given"), process.exit(0);

var fs = require('fs');
var path = require('path');

var s = list_dir( process.argv[2] ).forEach(function(p){ console.log(p); });
//var s = list_dir( process.argv[2] );
//console.log( JSON.stringify( s ) );


function ls_dir ( dir_path, set ) 
{
    try {
        var stat = fs.statSync( dir_path );
    } catch(e) {
        process.stderr.write( "error: \""+dir_path+'" not found' +"\n" );
        return null;
    }

    if ( !stat.isDirectory() ) 
        set.push( dir_path );
    else
    {
        var dir = fs.readdirSync( dir_path );

        for ( var i = 0, l = dir.length ; i < l; i++ ) {
            dir[i] = path.resolve( dir_path, dir[i] );

            stat = fs.statSync( dir[i] );
            if ( stat.isDirectory() ) 
                ls_dir( dir[i], set );
            else
                set.push( dir[i] );
        }
    }
}

function list_dir( _dir ) {
    var set = [];
    ls_dir( path.resolve(_dir), set );
    return set;
}

