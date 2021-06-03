# gbxutils

Utilities for manipulating Trackmania maps and possibly more.

## Working tools

These are in the `bin` folder and should be run with node. Be careful not to
clobber your input files with outputs. This project is still very new and likely
to be buggy.

### gbxtojson.js

`node bin/gbxtojson.js SomeChallengeFile.Gbx OutputFilename.json`

(In Windows you can use backslashes instead of forward slashes.)

Loads a Trackmania map/challenge file and outputs a json representation. This
tool is still incomplete and does not parse the body yet. Parsing the body is
the next milestonre.

### gbxurls.js

```
node bin/gbxtojson.js Input.Gbx
node bin/gbxtojson.js Input.Gbx Output.Gbx 'pattern' 'replacement'
node bin/gbxtojson.js Input.Gbx Output.Gbx 'pattern' 'replacement' 'flags'
```

The first command lists dependency URLs found in Input.Gbx. The other versions
replace matching patterns in the URLs. `pattern` and `replacement` should be
[Javascript RegExp](https://developer.mozilla.org/docs/Web/JavaScript/Guide/Regular_Expressions)
strings. If you don't understand regular expressions, simple text should
suffice. For example, if your files have moved to a different server address,
but the path names are the same, you could use:

```
node bin/gbxtojson.js Input.Gbx Output.Gbx old.example.com new.example.com
```

The most useful flags are 'i' to ignore case during pattern matching (so 'a'
matches 'a' or 'A' etc) and 'g' to replace all occurrences of matching patterns
in one string. The default behaviour is to replace only the first match. Note
this applies to one URL string at a time. You can use both flags at once by
typing 'ig' or 'gi'.

## Goal

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

## Technical details

The code is written in Javascript and should be run with
[node.js](https://nodejs.org/) (used to be gjs, but that's rather awkward for
MS Windows users). It doesn't need to be installed with npm, it can simply be
run in place.

## minilzo and sax-js

`lib/lzo1x.js` and `lib/sax.js` are not my own work. I copied them from
[minilzo-js](https://github.com/abraidwood/minilzo-js) and
[sax-js](https://github.com/isaacs/sax-js) respectively and simply added
export directives. Refer to those files or projects for their licence details.
