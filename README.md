
# Node Server Skeleton

Lightweight, simple, configurable, drop-in and go http server for Node.js.

## motivation

I wanted to have a simple, but effective relatively fast framework that could
be used with many different web projects merely by dropping in a different config. My desire at the time was to learn node's http functionality by doing rather than just reading through Express (though now I do that anyway). *Java Play* was a sort of inspiration for the general idea. But it also grew out of necessity.

Example Usage:

```sh
~$ node server/start_server.js sample_aps/simplest_page

~$ node server/start_server.js --help

~$ node server/start_server.js ../my_cool_website 80
```

The 4th argument (optional) is port. Defaults to 8000 for testing. 

## config.js

The server sets itself up via a config.js file that is found inside the project
directory at the top level.  The 3rd argument after the start_server.js script is
the path to the project-directory.  config.js is optional, as the server will
serve static files from the project directory absent of any other instruction.

## static_dir

a static directory (```static_dir```) is set in the config.js at startup. This
directory and its sub-directories are the only place where files are allowed to 
be served from.  Even so, there are two config vars, both arrays, that can be set
to add additional things blocked from serving: ```block_list``` for files, and 
```block_dirs``` for directories.  The server will block *any* path that has any
member of block_dirs[] within it.  

## handlers & router

config.js is where handlers are setup for the router.  That is, functions which
run some routine and return a response to the server, rather than simply dishing out
a file.  See the sample projects for examples how to do this.

## contact

greg AT naughton DOT org for comments, questions, etc.  I would love to hear from 
you if you are using this in your project.  

Peace
