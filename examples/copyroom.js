// This example copies a room, rotates it 180deg and pastes it elsewhere
import {userTransformMain} from "../lib/transform.js";
import {copyBlocks, rotateSelection, translateSelection, pasteBlocks,
    getSelectionBounds} from "../lib/tools.js";

// These ranges are inclusive
const SRC_XRANGE = [13, 31];
const SRC_ZRANGE = [19, 31];

// This filter selects blocks based on their position. All blocks within the
// above x and z ranges, at any height (y), will be selected
function filter(block) {
    return block.x >= SRC_XRANGE[0] && block.x <= SRC_XRANGE[1] &&
        block.z >= SRC_ZRANGE[0] && block.z <= SRC_ZRANGE[1];
}

// This userTransform function copies blocks which are selected by the above
// filter, rotates the selection by 180deg, moves it to a different part of the
// map and pastes it there.
function copyTransform(gbxFile) {
    const seln = copyBlocks(gbxFile, filter);
    console.log(
        `Selected ${seln.length} blocks in bounds ${getSelectionBounds(seln)}`);
    rotateSelection(seln, 2, false);
    console.log(`Rotated selection has bounds ${getSelectionBounds(seln)}`);
    // After rotation the blocks will be in range x: [-31, -13], z: [-31, -19];
    // translate them to DEST_RANGE x: [13, 31], z: [0, 12]
    translateSelection(seln, 13 + 31, 0, 31);
    console.log(`Translated selection has bounds ${getSelectionBounds(seln)}`);
    pasteBlocks(gbxFile, seln);
}

userTransformMain(copyTransform);
