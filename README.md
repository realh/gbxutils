gbxutils
========

Utilities for manipulating Trackmania maps and possibly more.

Status
------

This project is embryonic and doesn't do much useful yet. At the moment it can
only load a gbx file, partially parse it, and save a JSON representation, using
the `tojson` tool.

Goal
----

The main aim is to allow large scale copy, transform and paste operations in
Trackmania Nations Forever maps. There are two possible ways this project can
achieve that, but I don't know which one (or both) will be implemented.

1. Provide a library to make it easy to write scripts that select and
   manipulate blocks flexibly. This is a simpler option for this project, but
   more difficult for 3rd party users.

2. TMNF maps can be imported into Trackmania 2 Stadium, which has a much more
   powerful editor, including copy, transform & paste. However, after a map has
   been saved by TM2 it can't be loaded back into TMNF. This project may be
   able to provide a tool to convert TM2 maps back into TMNF format, as long as
   no new or custom blocks have been added.

Technical details
-----------------

The code is written in Javascript and should be run with
[gjs](https://gitlab.gnome.org/GNOME/gjs) via shell script wrappers provided in
the project root. At some point I'll probably have to convert it to run in
[node.js](https://nodejs.org/) to make it more accessible for MS Windows users.

minilzo
-------

`js/core/lzo1x.js` is not my own work. I copied it from the
[minilzo-js project](https://github.com/abraidwood/minilzo-js) and simply added
the `export` keyword.
