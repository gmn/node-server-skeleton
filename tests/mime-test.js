// actually, the best strategy for speeding up the mime-lookup would be to simply 
// separate mime-types into two tables, one that is small: ~15-30, containing the
// most commonly requested types: (basically the ones below).  If its not found in
// that table, resort to loading and searching in the large table.

var mimes = require('../server/server_files/mime');
var validExtensions = {
    ".html" : "text/html",          
    ".js": "application/javascript", 
    ".css": "text/css",
    ".txt": "text/plain",
    ".jpg": "image/jpeg",
    ".gif": "image/gif",
    ".png": "image/png",
    ".pdf": "?",
    ".flv": "?",
    ".mp4": "?",
    ".gz":  "?",
    ".gzip":  "?",
    ".csv": "?",
    ".htm": "?"
};

for ( var i in validExtensions ) {
    if ( validExtensions.hasOwnProperty(i) ) {
        console.log( '"'+i+'": '+ validExtensions[i] + ' --> ' + mimes.find(i) );
    }
}

[ ".json", ".css", ".mp4", ".m4a", ".aac", ".avi", "htm", ".js"].forEach(function(mime){
    console.log( mimes.find( mime ) );
});

