// Finds which "room" perimeter blocks contain a StadiumPlatformWallPub2 block
// and replaces all pairs of StadiumPlatformWallBorder blocks in the same column
// with duplicates of the Pub2.
import {userTransformMain} from "../lib/transform.js";
import {cutBlocks, copyBlocks, pasteBlocks} from "../lib/tools.js";

// These ranges are inclusive
const XRANGE = [13, 31];
const ZRANGE = [19, 31];

// This filter selects blocks based on their position and type. It matches
// StadiumPlatformWallPub2 blocks in the "room"'s perimeter.
function match_pub2(block) {
    // Note that the blockName field is a "lookbackstring" which gbxutils stores
    // as a tuple of [string, flags].
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

// Matches StadiumPlatformWallBorder blocks in the same x and z positions as
// any of the given Pub2 blocks in pub2s.
function match_border(block, pub2s) {
    if (block.blockName[0] != "StadiumPlatformWallBorder") { return false; }
    for (const pb of pub2s) {
        if (block.x == pb.x && block.z == pb.z) {
            return true;
        }
    }
    return false;
}

function replaceTransform(gbxFile) {
    // First find the locations of all the Pub2 blocks
    const pub2s = copyBlocks(gbxFile, match_pub2);
    // Now find and delete all the Border blocks in the same vertical columns
    const borders = cutBlocks(gbxFile, (block) => match_border(block, pub2s));
    // Replace the borders at odd heights with copies of the Pub2 blocks
    let p2 = pub2s[0];
    let newBlocks = [];
    for (const block of borders) {
        if (block.y % 1 != 0) {
            continue;
        }
        p2 = p2.clone();
        p2.x = block.x;
        p2.y = block.y;
        p2.z = block.z;
        p2.rotation = block.rotation;
        newBlocks.push(p2);
    }
    pasteBlocks(gbxFile, newBlocks);
}

userTransformMain(replaceTransform);
