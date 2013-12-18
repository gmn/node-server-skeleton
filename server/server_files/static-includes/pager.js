// basic table pager

/* 
    WANT:
        X ability to set entire rows from [Array]
        - automatic header link generation (see gradapp internal page) if headers are provided
        - automatic table building from hierarchical JSON
        - ability to fully style and set custom sorting functions for each column
        - runs easily in the browser
            $.ajax(someurl,function(retjson){
                var T = new CTable( retjson, {table:{css:pairs},td:{css:pairs},tr:...,th:...} );
                $("#tdiv").html( T.html() );
            });
*/

// make available in local scope if neither node.js module or browser

// namespace
var ctable = (function(ctable){

    // keep track of built tables
    var ctables = [];

    function CRow()
    {
        this.sort_col = 0;
        this.data = [];
        this.sort = [];
    }

    CRow.prototype = 
    {
        add: function(  val, sort_special ) {
            this.data.push( val );
            if ( arguments.length > 1 && sort_special ) {
                this.sort.push( sort_special );
            }
        }
    };

    function CTable( json, css )
    {
        this.cur_row = -1;
        this.rows = [];
        this.headers = [];
        this.pad_output = true; // not using
        this.id = this.auto_id();

        // for table wide definitions:
        // structure, can be any of: { "table":{},"th":{},"tr":{},"td":{} } 
        this.styles = {}; 


        if ( json ) {
            this.loadJSON(json);
        }
        if ( css ) {
            this.loadCSS(css);
        }

        ctables.push(this);        
        this.index = ctables.length - 1;
        this.direction = false; // true is descending
    }

    CTable.prototype = 
    {
        new_row: function() {
            this.rows.push( new CRow() );
            ++this.cur_row;
        },

        // adds one column at a time, assumes user calls new_row() 
        add: function ( val, spec )
        {
            if ( this.cur_row === -1 ) {
                this.new_row();
            }
            this.rows[this.cur_row].add( val, spec );
        },

        // sets an entire row. calls new_row() itself
        add_row: function( ary ) 
        {
            if ( ary instanceof Array ) {
                this.new_row();
                var that = this;
                ary.forEach(function(x) {
                    that.rows[that.cur_row].add(x);
                });
            }
            else /* failover to add() if not Array */
            {
                this.add.apply(arguments);
            }
        },

        dprint: function( spacing, xtra ) {
            var s = spacing ? spacing : ' ';
            this.rows.forEach(function(row) {
                console.log( row.data.join( s ) );
            });
            if ( xtra )
                console.log( xtra );
        },

        html: function( header ) {
            var c = this.getStyle( 'table' );
            var id = ' id="'+this.id+'"';
            // allow explicitly set styles to trump Object styles
            var s = header ? '<table'+id+c+' ' + header + " >\n" : "<table"+id+c+">\n" ;

            var that = this;
            c = this.getStyle('tr');

            // <th> row
            var h = this.getStyle('th');
            if ( this.headers.length > 0 ) 
                s += "  <tr"+c+">\n";
            for ( var i = 0; i < this.headers.length; i++ ) {
                s += "    <th"+h+" onclick=\"sortCTable("+this.index+","+i+")\">"+this.headers[i]+"</th>\n";
            }
            if ( this.headers.length > 0 ) 
                s += "  </tr>\n";


            // <tr><td> rows
            var d = this.getStyle('td');
            this.rows.forEach(function(row) {
                s += "  <tr"+c+">\n";
                row.data.forEach(function(col) {
                    s += "    <td"+d+">"+col+"</td>\n";
                } );
                s += "  </tr>\n";
            });

            return s + "</table>\n";
        },

        sort_by: function( col, desc ) 
        {
            var direction = desc ? -1 : 1;

            this.rows.sort(function(a,b) {
                if ( typeof a.data[col] === "string" && typeof b.data[col] === "string" )
                    return a.data[col].localeCompare(b.data[col]) * direction;
                else
                    return a.data[col] > b.data[col] ? direction : -direction;
            });
        },

        loadJSON: function(j) {
            // structure. either are optional: { "table" : [ [ ] ], "css" : {} }
            //  OR
            // structure: { "table":{"th":[e,e,e],"tbody":[[a,b,c],[d,e,f]] }, "css":{} }
            if ( j && typeof j === 'string' ) 
                j = JSON.parse(j);
            
            if ( j && typeof j === 'object' && j.table ) {
                var table = j.table;
                var that = this;

                var rows = typeof table === "object" && table.tbody ? table.tbody : table;

                rows.forEach(function(row){
                    that.add_row.call(that,row);
                });

                if ( typeof table === "object" && table.th ) 
                    this.headers = table.th;

            }
            if ( j && j.css ) {
                this.loadCSS(j.css);
            }
        },

        loadCSS: function(css) {
            // structure, can be any of: { "table":{},"th":{},"tr":{},"td":{} }, for table wide definitions.
            // for specific rows & columns: { "x": ... err, not sure
            if ( typeof css === 'object' && (css.table || css.th || css.tr || css.td) )
                this.styles = css;
        },

        // get style information for a certain key, and format as => 'style="key1:val1;key2:val2;"'
        getStyle: function( elt ) {
            var c = '';
            if ( this.styles[elt] ) {
                var t = this.styles[elt];
                c = ' style="';
                for ( var i in t ) {
                    if ( t.hasOwnProperty(i) ) {
                        c += i+':'+t[i]+';';   
                    }
                }
                c += '" ';
            }
            return c;
        },

        auto_id: function() 
        {
            function base_convert( num, base )
            {
                var HEX_LETTERS = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'];
                num = Math.floor(num) + '';
                var div = num;
                num = [];

                while ( div >= 1.0 ) {
                    var mod = Math.floor( div % base );
                    num.push( HEX_LETTERS[mod] );
                    div = div / base;
                }

                return num.reverse().join('');
            }
            var r = Math.floor(Math.random()*10000000);
            //return '_' + base_convert( r, 16 );
            //return '_' + base_convert( r, 16 );
            return 'T'+  base_convert( r, 16 );
        },

        toggleDirection: function () {   
            this.direction = !this.direction;
            return this.direction;
        }
    }; //CTable.prototype

    function sortCTable( index, col ) 
    {
        alert( index + ' ' + col );
        var table = this.ctables[index];
        table.sort_by(col,table.toggleDirection());
        
    }

    ctable.CTable = CTable;
    ctable.CRow = CRow;
    ctable.sortCTable = sortCTable;

    try {
        if ( window ) {
            window.CTable = CTable;
            window.CRow = CRow;
            window.ctables = ctables;
        }
    } catch(e) { }

    return ctable;

})(typeof exports === "undefined" ? {} : exports);

var CTable = ctable.CTable;
var CRow = ctable.CRow;
var sortCTable = ctable.sortCTable;


/* test 1
var table = new CTable();
var a = 'a'.charCodeAt(0);
var dim = 5;
for ( var i = 0; i < dim; i++ ) {
    table.new_row();
    var end = a + dim;
    table.add( a++ );
    while ( a < end ) {
        table.add( String.fromCharCode(a++) );
    }
}
table.sort_by(0,true);
table.dprint();
console.log( "\n" + table.html() );
*/

/* test 2
var t2 = new CTable();
t2.add_row( [ 'a', 7, 'z', 1 ] );
t2.add_row( [ 'b', 6, 'y', 2 ] );
t2.add_row( [ 'c', 5, 'x', 3 ] );
t2.dprint(' ','');
t2.sort_by( 2 );
t2.dprint(' ','');
t2.sort_by( 3 );
t2.dprint(' ','');
t2.sort_by( 3, true );
t2.dprint(' ','');
*/

/* test 3
//var json = JSON.parse( '{"table":[[1,2,3,4],["a","b","c","d"]],"css":{"table":{"border":"2px dashed red","background-color":"#909"}}}' );
var json = JSON.parse('{"table":[[1,2,3,4],["a","b","c","d"]],"css":{"table":{"border":"2px dashed brown","padding":"10px"},"td":{"padding":"8px","font-weight":"bold","border":"1px solid #bbb"}}}' );
var t = new CTable(json);
console.log( "\n" + t.html() );
*/

/* test 4
var t = new CTable( '{"table":{"th":["one","two","three","four"],"tbody":[[1,2,"a","f","b"],[6,4,"c","d","e"]]},"css":{"table":{"border":"1px solid brown","padding":"3px","margin":"5px"},"td":{"padding":"8px","font-weight":"bold","border":"1px solid #bbb"},"th":{"font-style":"italic","font-weight":"normal"}}}' );
console.log( "\n" + t.html() );
*/


