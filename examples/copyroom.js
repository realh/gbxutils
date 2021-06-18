// This example deletes all the blocks within a rectangular cuboid
import {userTransformMain} from "../lib/transform.js";
import {copyBlocks, rotateSelection, translateSelection, pasteBlocks} from
    "../lib/tools.js";

// These ranges are inclusive
const SRC_XRANGE = [13, 31];
const SRC_ZRANGE = [0, 12];

// This filter selects blocks based on their position. All blocks within the
// above x and z ranges, at any height (y), will be deleted
function filter(block) {
    return block.x >= SRC_XRANGE[0] && block.x <= SRC_XRANGE[1] &&
        block.z >= SRC_ZRANGE[0] && block.z <= SRC_ZRANGE[1];
}

// This userTransform function copies blocks which are selected by the above
// filter, rotates the selection by 180deg, moves it to a different part of the
// map and pastes it there.
function copyTransform(gbxFile) {
    const seln = copyBlocks(gbxFile, filter);
    rotateSelection(seln, 2, false);
    // After rotation the blocks will be in range x: [-31, -13], z: [-12, 0];
    // translate them to DEST_RANGE x: [13, 31], z: [19, 31]
    translateSelection(seln, 13 + 31, 0, 31);
    pasteBlocks(body, seln);
}

userTransformMain(copyTransform);
