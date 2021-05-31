gbxutils
========

Utilities for manipulating Trackmania maps and possibly more.

Status
------

This project is embryonic and doesn't do much useful yet. At the moment it can
only load a gbx file, partially parse it, and save a JSON representation, using
the `gbxtojson.js` tool.

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
[node.js](https://nodejs.org/) (used to be gjs, but that's rather awkward for
MS Windows users). It doesn't need to be installed with npm, it can simply be
run in place.

minilzo and sax-js
------------------

`lib/lzo1x.js` and `lib/sax.js` are not my own work. I copied them from
[minilzo-js](https://github.com/abraidwood/minilzo-js) and
[sax-js](https://github.com/isaacs/sax-js) respectively and simply added
export directives. Refer to those files or projects for their licence details.
