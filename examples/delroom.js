// This example deletes all the blocks within a rectangular cuboid
import {userTransformMain} from "../lib/transform.js";
import {cutBlocks, getBlocksChunk} from "../lib/tools.js";

// These ranges are inclusive
const XRANGE = [13, 31];
const ZRANGE = [19, 31];

// This filter selects blocks based on their position. All blocks within the
// above x and z ranges, at any height (y), will be deleted
function filter(block) {
    return block.x >= XRANGE[0] && block.x <= XRANGE[1] &&
        block.z >= ZRANGE[0] && block.z <= ZRANGE[1];
}

// This userTransform function cuts blocks which are selected by the above
// filter.
function cutTransform(gbxFile) {
    const bChunk = getBlocksChunk(gbxFile);
    const nBlocks = bChunk.numBlocks;
    const seln = cutBlocks(gbxFile, filter);
    console.log(`Deleted ${seln.length}/${nBlocks} blocks`);
}

userTransformMain(cutTransform);
