// speed up mime by search small subset of most common mime-types first

var deeplib = null;

function find( extension )
{
    var common = {
        ".html" :   "text/html",          
        ".js":      "application/javascript", 
        ".css":     "text/css",
        ".txt":     "text/plain",
        ".jpg":     "image/jpeg",
        ".jpeg":    "image/jpeg",
        ".gif":     "image/gif",
        ".png":     "image/png",
        ".pdf":     "application/pdf",
        ".flv":     "video/x-flv",
        ".mp4":     "video/mp4",
        ".gz":      "application/x-gzip"
    };

    if ( extension[0] !== '.' )
        extension = '.'+extension;

    if ( common[extension] )
        return common[extension];

    // late loading, only load once we need it, and even then, make sure to only load once
    if ( !deeplib ) {
        deeplib = require('./mime-deep');
    }

    return deeplib.find( extension );
}
exports.find = find;
