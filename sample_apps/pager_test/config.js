

exports.config = 
{
    // optional but recommended. In fact all config options are optional.
    'application_name' : 'Pager Test',

    // router definitions
    'handlers' : {
        '/config' : function( req, res, lib ) {
            res.writeHead( 200, { 'Content-Type' : 'text/plain' } );
            res.write( lib.pobj( lib.config ) );
            res.end();
        },

        '/ajax_handler' : function( req, res, lib ) {
            res.writeHead( 200, { 'Content-Type' : 'text/plain' } );
            res.end( '{"table":{"th":["one","two","three","four","five"],"tbody":[["1","2","a","f","b"],["6","4","c","d","e"],["z","y","x","w","t"]]},"style":{"table":{"border":"1px solid brown","padding":"3px","margin":"5px"},"td":{"padding":"8px","font-weight":"bold","border":"1px solid #bbb"},"th":{"font-style":"italic","font-weight":"normal","padding":"8px","background-color":"#EDB21B"}},"class":"htable"}' );
        }
    }
};
