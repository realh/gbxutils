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

// Returns an array of ChallengeBlock objects, which are selected based on the
// filter function. filter takes one parameter, a ChallengeBlock. It should
// return true if the block should be selected. If cut is true, selected blocks
// are removed from the map.
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
        const block = blocks.blocks[i];
        if (filter(block)) {
            matches.push(block);
            if (cut) {
                if (!checkpoints) {
                    checkpoints = getCheckpointsChunk(body);
                }
                deleteBlock(body, i, blocks, checkpoints);
                --i;
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
