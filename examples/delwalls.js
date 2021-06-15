// This example is similar to delroom.js but deletes the walls surrounding
// a different part of the map
import {userTransformMain} from "../lib/transform.js";
import {cutBlocks, getBlocksChunk} from "../lib/tools.js";

// These ranges are inclusive
const XRANGE = [13, 31];
const ZRANGE = [0, 12];

// This filter selects blocks based on their position and type. All walls
// around the edges of the above x and z ranges will be deleted
function filter(block) {
    // We only want to remove a certain block type. Note that the blockName
    // field is a "lookbackstring" which gbxutils stores as a tuple of
    // [string, flags].
    if (block.blockName[0] != "StadiumPlatformWallBorder") { return false; }
    if (block.x >= XRANGE[0] && block.x <= XRANGE[1] &&
        (block.z == ZRANGE[0] || block.z == ZRANGE[1]))
    {
        return true;
    }
    if (block.z >= ZRANGE[0] && block.z <= ZRANGE[1] && 
        (block.x == XRANGE[0] || block.x == XRANGE[1]))
    {
        return true;
    }
    return false;
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
