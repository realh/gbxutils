// Replaces the paintable walls around the "room" with a pair of plain black
// wall/borders (which are half the height of the paintable ones).
import {userTransformMain} from "../lib/transform.js";
import {cutBlocks, getBlocksChunk, pasteBlocks} from "../lib/tools.js";
import { ChallengeBlock } from "../lib/chunks/ChallengeBlocks.js";

// These ranges are inclusive
const XRANGE = [13, 31];
const ZRANGE = [19, 31];

// This filter selects blocks based on their position and type. All walls
// around the edges of the above x and z ranges will be replaced.
function filter(block) {
    // We only want to replace a certain block type. Note that the blockName
    // field is a "lookbackstring" which gbxutils stores as a tuple of
    // [string, flags].
    if (block.blockName[0] != "StadiumPlatformWallPub2") { return false; }
    if (block.x >= XRANGE[0] && block.x <= XRANGE[1] &&
        (block.z == ZRANGE[0] || block.z == ZRANGE[1] ||
            block.z == ZRANGE[0] + 1))
    {
        return true;
    }
    if (block.z >= ZRANGE[0] && block.z <= ZRANGE[1] && 
        (block.x == XRANGE[0] + 1 || block.x == XRANGE[1] - 1))
    {
        return true;
    }
    // console.log(`Keeping Pub2 at x=${block.x}, z=${block.z}`);
    return false;
}

// Finds and returns a StadiumPlatformWallBorder block from the gbx file.
// Trying to create one using `new ChallengeBlock(...)`, or by modifying a
// StadiumPlatformWall block, creates an invalid block which crashes the game.
function findWallBorder(gbxFile) {
    const blocksChunk = getBlocksChunk(gbxFile);
    for (const block of blocksChunk.blocks) {
        if (block.blockName[0] == "StadiumPlatformWallBorder") {
            return block;
        }
    }
    throw new Error("No StadiumPlatformWallBorder block found");
}

// This userTransform function cuts blocks which are selected by the above
// filter and replaces them with plain black wall/border blocks.
function replaceTransform(gbxFile) {
    let wb = findWallBorder(gbxFile);
    const seln = cutBlocks(gbxFile, filter);
    let newBlocks = [];
    for (const block of seln) {
        wb = wb.clone();
        wb.rotation = block.rotation;
        wb.x = block.x;
        wb.y = block.y;
        wb.z = block.z;
        newBlocks.push(wb);
        wb = wb.clone();
        wb.y += 1;
        newBlocks.push(wb);
    }
    pasteBlocks(gbxFile, newBlocks);
}

userTransformMain(replaceTransform);
