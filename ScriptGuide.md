# Guide to writing gbxutils scripts

## Getting started

I recommend that you make a new folder at the top-level of this folder. You can
call it whatever you like, eg `MyScripts`. Choose a script from the `examples`
folder that most closely matches what you're trying to do and copy it to
`MyScripts`.

The most typical type of script takes a gbx file as input, transforms it, then
saves a copy. The `userTransformMain` function from `lib/transform.js` makes
it easy to write a script like this. Just import that function and call it with
your transform function.

## Format of a block

Most of the functions generate or operate on a selection of blocks ie items that
can be added to a map in the in-game editor. In Javascript a selection consists
of an array of ChallengeBlock objects. The ChallengeBlock class is defined
in `lib/chunks/ChallengeBlocks.js`. In JSON a typical block looks like this:

```
{
  "blockName": ["StadiumCircuitBase", 1],
  "rotation": 2,
  "x": 20,
  "y": 1,
  "z": 31,
  "flags": "00001000",
  "index": 2692
}
```

The reason `blockName` is a tuple is because it is stored in a gbx file as a
`lookbackstring`, a custom type that reduces duplication for strings that may
be repeated throughout the file. The number is a flags value, usually 1.

Skinnable blocks look like this:

```
{
  "blockName": ["StadiumFabricCornerOut", 1],
  "rotation": 2,
  "x": 29,
  "y": 26,
  "z": 20,
  "flags": "00008000",
  "author": ["Nadeo", 1],
  "skin": {
    "nodeRefIndex": 3,
    "classID": 50696192,
    "node": {
      "chunks": [
        {
          "chunkName": "BlockSkin02",
          "chunkID": "3059002",
          "text": "!2",
          "packDesc": {
            "version": 2,
            "filePath": "Skins\\Any\\Advertisement\\Advert2.zip",
            "locatorUrl": ""
          },
          "parentPackDesc": {
            "version": 2,
            "filePath": ""
          }
        }
      ]
    },
    "refs": [
      {
        "nodeRefIndex": 3
      }
    ]
  },
  "index": 2693
}
```

The backslashes are shown doubled, because backslashes need to be "escaped" in
string literals in code.

The node reference indexes mean that maps could be broken by deleting or
duplicating skinnable blocks. I haven't tested this properly yet; if it does
cause problems I hope I will be able to fix it.

## GbxFile and GbxBody

`GbxFile` is the class representing an entire gbx body. The only truly useful
field in scripts is `body`, holding an instance of `GbxBody`. `GbxBody`'s most
useful field is `chunks`, an array of `GbxChunk` objects. The most useful
chunk type is `ChallengeBlocks` which has a `chunkID` field value of 0x0304301f
or 0x03043013 (`0x` is the prefix for hexadecimal).

In some circumstances you may also need to identify the `ChallengeCheckpoints`
chunk with id 0x03043017.  Most of the functions below automatically find these
chunks for themselves when necessary and ensure that the Checkpoints chunk is
kept in sync with the Blocks chunk. `bin/gbxdelcps.js` can serve as an example
of how to maintain sync between Blocks and Checkpoints if doing something more
unusual.

## Selection filters

To select blocks you need to provide a filter function. The filter function
takes one argument, a `ChallengeBlock`. It can look at the data in the block
and return true to add the block to the selection, false to skip it.

## Most essential functions in lib/tools.js

### copyBlocks(body, filter)

`blocks` is a GbxBody or GbxFile. It uses `filter` to select blocks and returns
the selection as an array of `ChallengeBlock` objects. These blocks are copies
of the originals.

### cutBlocks(body, filter)

Similar to `copyBlocks` but deletes the original blocks from the map. If there
are checkpoints in the selection they are also removed from the
`ChallengeCheckpoints` chunk.

### pasteBlocks(body, selection)

Pastes a floating selection back into the map. If the blocks were selected with
`copyBlocks` they should be be moved first by one of the transformation
functions, because it makes no sense to paste a block at the same coordinates
as an identical one.

If the selection contains checkpoints, they are also added to the 
`ChallengeCheckpoints` chunk.

### cloneSelection(selection)

Returns a new array of `ChallengeBlock`s which are copies of the originals. Use
this if you want to paste multiple copies of a selection.

### translateSelection(selection, x, y, z)

Moves every block in a selection by a fixed amount. x, y, and z represent the
distance to move each block. y is the vertical axis wrt the ground. Be careful,
because there are no checks for coordinates going out of range (0 to 31).
Blocks which take up more than one cell usually need to be placed so that all
their extremities are within range, not just their anchor points.

### rotateSelection(selection, rotation, centre = true)

Rotates a selection en masse about the vertical (y) axis. rotation is the
number of steps of 90 degrees with respect to looking down from above, so only
values of 1, 2 or 3 make sense.

If centre is true the rotation axis is in the centre of the stadium (x = z =
16) instead of (0, 0). If centre is false you will have to perform a
translation afterwards to correct negative coordinates.

### flipSelection(selection, flipX, flipZ, centre = true)

Flips a selection en masse about the x and/or z axis.  If centre is true the
axis is in the centre of the stadium (x or z = 16) instead of at x or z = 0. If
centre is false you will have to perform a translation afterwards to correct
negative coordinates.

## Less frequently used functions

These are not normally called directly from a user script, but are often used
internally by the above functions.


### findChunk(body, id)

Finds the (first) chunk with a given id in a GbxBody or GbxFile and returns the
chunk.

### getBlocksChunk(body)

Returns the Blocks chunk in a GbxBody or GbxFile.

### getCheckpointsChunk(body)

Returns the Checkpoints chunk in a GbxBody or GbxFile.

### deleteBlock(body, i, blocks, checkpoints)

Deletes the block at index i of body's blocks chunk. If the block is a
checkpoint it is also removed from the ChallengeCheckpoints chunk. body can
be a GbxBody or GbxFile. blocks and checkpoints can optionally be the body's
ChallengeBlocks and ChallengeCheckpoints respectively (to save looking them
up multiple times if this is being called across a selection).

### appendBlock(body, block, blocks, checkpoints)

Appends a block to body's blocks chunk. If the block is a checkpoint it is also
added to the ChallengeCheckpoints chunk. body can be a GbxBody or GbxFile.
blocks and checkpoints can optionally be the body's ChallengeBlocks and
ChallengeCheckpoints respectively (to save looking them up multiple times if
this is being called across a selection).

### selectBlocks(body, filter, cut = false)

Used by `cutBlocks` and `copyBlocks`.
