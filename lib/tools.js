import {GbxBody} from "./body.js";
import {GbxFile} from "./gbxfile.js";

// Finds the (first) chunk with a given id in a GbxBody or GbxFile
export function findChunk(body, id) {
    if (body instanceof GbxFile) {
        body = body.body;
    }
    const keys = Object.getOwnPropertyNames(body);
    let chunk = null;
    for (const c of body.chunks) {
        if (c.chunkID == id) {
            chunk = c;
            break;
        }
    }
    return chunk;
}

export function getBlocksChunk(body, id) {
    let chunk = findChunk(body, 0x0304301f);
    if (!chunk) {
        chunk = findChunk(body, 0x03043013);
    }
    if (!chunk) {
        console.warn(`Map has no ChallengeBlocks chunk`);
    }
    return chunk;
}

export function getCheckpointsChunk(body, id) {
    const chunk = findChunk(body, 0x03043017);
    if (!chunk) {
        console.warn(`Map has no ChallengeCheckpoints chunk`);
    }
    return chunk;
}

// Deletes the block at index i of body's blocks chunk. If the block is a
// checkpoint it is also removed from the ChallengeCheckpoints chunk. body can
// be a GbxBody or GbxFile. blocks and checkpoints can optionally be the body's
// ChallengeBlocks and ChallengeCheckpoints respectively (to save looking them
// up multiple times if this is being called across a selection).
export function deleteBlock(body, i, blocks, checkpoints) {
    if (body instanceof GbxFile) {
        body = body.body;
    }
    if (!blocks) {
        blocks = getBlocksChunk(body);
    }
    const block = blocks.blocks[i];
    if (block.blockName[0].includes("Checkpoint")) {
        if (!checkpoints) {
            checkpoints = getCheckpointsChunk(body);
        }
        checkpoints.removeCheckpointAt(block.x, block.y, block.z);
    }
    blocks.blocks.splice(i, 1);
    --blocks.numBlocks;
    blocks.sizeChangeIsHarmless = true;
    blocks.addArrayTemplate("blocks", -1);
}

// Appends a block to body's blocks chunk. If the block is a checkpoint it is
// also added to the ChallengeCheckpoints chunk. body can be a GbxBody or
// GbxFile. blocks and checkpoints can optionally be the body's ChallengeBlocks
// and ChallengeCheckpoints respectively (to save looking them up multiple
// times if this is being called across a selection).
export function appendBlock(body, block, blocks, checkpoints) {
    if (body instanceof GbxFile) {
        body = body.body;
    }
    if (!blocks) {
        blocks = getBlocksChunk(body);
    }
    if (block.blockName[0].includes("Checkpoint")) {
        if (!checkpoints) {
            checkpoints = getCheckpointsChunk(body);
        }
        checkpoints.addCheckpointAt(block.x, block.y, block.z);
    }
    blocks.blocks.push(block);
    ++blocks.numBlocks;
    blocks.sizeChangeIsHarmless = true;
    blocks.addArrayTemplate("blocks", 1);
}

// Returns an array of ChallengeBlock objects, which are selected based on the
// filter function. filter takes one parameter, a ChallengeBlock. It should
// return true if the block should be selected. If cut is true, selected blocks
// are removed from the map; if not, the returned blocks are clones of the
// priginals.
// body may be a GbxBody or a GbxFile.
export function selectBlocks(body, filter, cut = false) {
    if (body instanceof GbxFile) {
        body = body.body;
    }
    const blocks = getBlocksChunk(body);
    if (!blocks) {
        return null;
    }
    const matches = [];
    let checkpoints = null;
    for (let i = 0; i < blocks.numBlocks; ++i) {
        let block = blocks.blocks[i];
        if (filter(block)) {
            if (cut) {
                if (!checkpoints) {
                    checkpoints = getCheckpointsChunk(body);
                }
                deleteBlock(body, i, blocks, checkpoints);
                --i;
            } else {
                block = block.clone();
                matches.push(block);
            }
        }
    }
    return matches;
}

// Calls selectBlocks with cut = false
export function copyBlocks(body, filter) {
    return selectBlocks(body, filter, false);
}

// Calls selectBlocks with cut = true
export function cutBlocks(body, filter) {
    return selectBlocks(body, filter, true);
}

// Pastes a floating selection made by selectBlocks() back into the map
export function pasteBlocks(body, selection) {
    if (body instanceof GbxFile) {
        body = body.body;
    }
    const blocks = getBlocksChunk(body);
    const checkpoints = getCheckpointsChunk(body);
    for (const blk in selection) {
        appendBlock(body, blk, blocks, checkpoints);
    }
}

// Moves every block in a selection by a fixed amount. x, y, and z represent
// the distance to move each block. Be careful, because there are no checks
// for coordinates going out of range (0 to 31).
export function translateSelection(selection, x, y, z) {
    x = x ?? 0;
    y = y ?? 0;
    z = z ?? 0;
    for (const blk in selection) {
        blk.x += x;
        blk.y += y;
        blk.z += z;
    }
}

const rotationTable = [
    [0, 1, -1, 0],
    [-1, 0, -1, 0],
    [0, -1, 1, 0]
];

// Rotates a selection en masse about the y axis. rotation is the number of
// steps of 90 degrees relative to looking down from above, so only values of
// 1, 2 or 3 make sense.
// If centre is true the rotation axis is in the centre of the stadium
// (x = z = 16) instead of (0, 0). If centre is false you will have to
// perform a translation afterwards to correct negative coordinates.
export function rotateSelection(selection, rotation, centre = true) {
    if (!(rotation in [1, 2, 3])) {
        throw Error(`Rotation should be 1, 2 or 3, you used ${rotation}`);
    }
    const matrix = rotationTable[rotation - 1];
    for (const blk in selection) {
        blk.x = blk.x * matrix[0] + blk.z * matrix[1];
        blk.z = blk.x * matrix[2] + blk.z * matrix[3];
        blk.rotation = (blk.rotation + rotation) % 4;
    }
    if (centre !== false) {
        let x, z;
        switch (rotation) {
        case 1:
            x = 0;
            z = 31;
            break
        case 2:
            x = 32;
            z = 31;
            break
        case 3:
            x = 31;
            z = 0;
            break
        }
        translateSelection(selection, x, 0, z);
    }
}

// Flips a selection en masse about the x and/or z axis. 
// If centre is true the axis is in the centre of the stadium (x or z = 16)
// instead of at x or z = 0. If centre is false you will have to perform a
// translation afterwards to correct negative coordinates.
export function flipSelection(selection, flipX, flipZ, centre = true) {
    if ((typeof flipX != "boolean") || (typeof flipZ != "boolean")) {
        throw Error("flipX and flipZ must be boolean");
    }
    if (!flipX && !flipZ) {
        console.log("flipX and flipZ are both false, no change");
        return;
    }
    for (const blk in selection) {
        if (flipX) {
            if (centre !== false) {
                blk.x = 31 - blk.x;
            } else {
                blk.x = -blk.x;
            }
        }
        if (flipZ) {
            if (centre !== false) {
                blk.z = 31 - blk.z;
            } else {
                blk.z = -blk.z;
            }
        }
    }
}
