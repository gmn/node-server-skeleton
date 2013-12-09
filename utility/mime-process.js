
var fs = require('fs');

var f = fs.readFileSync('mime-types',{encoding:'utf8',flag:'r'});

var lines = f.split("\n");
var rows = [];
lines.forEach(function(line){
    if (line.trim().length > 0)
        rows.push(line.split(/[\s]+/));
});

var mimes = [];

rows.forEach(function(row){
    var m = {m:row[0],e:[]};
    for (var i = 1; i < row.length; i++)
    {
        m.e.push( row[i] );
    }
    mimes.push( m );
});

console.log(JSON.stringify(mimes));


