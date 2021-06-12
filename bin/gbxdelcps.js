import {loadGbxFile, saveGbxFile} from "../lib/gbxfile.js";
import {cutBlocks} from "../lib/tools.js";

const equivalents = {
    "StadiumRoadMainCheckpoint": ["StadiumRoadMain", 0],
    "StadiumRoadMainCheckpointUp": ["StadiumRoadMainSlopeStraight", 0],
    "StadiumRoadMainCheckpointDown": ["StadiumRoadMainSlopeStraight", 2],
    "StadiumRoadMainCheckpointLeft": ["StadiumRoadTiltStraight", 2],
    "StadiumRoadMainCheckpointRight": ["StadiumRoadTiltStraight", 0],
    "StadiumPlatformCheckpoint": ["StadiumPlatformRoad", 0],
    "StadiumPlatformCheckpointDown": ["StadiumPlatformSlope2Straight", 2],
    "StadiumPlatformCheckpointLeft": ["StadiumPlatformSlope2Straight", 1],
    "StadiumPlatformCheckpointRight": ["StadiumPlatformSlope2Straight", 3],
    "StadiumPlatformCheckpointUp": ["StadiumPlatformSlope2Straight", 0],
    "StadiumRoadDirtCheckpoint": ["StadiumRoadDirt", 0],
    "StadiumRoadDirtHighCheckpoint": ["StadiumRoadDirtHigh", 0],
}

function filter(block) {
    const name = block.blockName[0];
    if (!name.includes("Checkpoint")) {
        console.log(`${name} is not a checkpoint`);
        return false;
    }
    const replacement = equivalents[name];
    if (!replacement) {
        //console.log(`  Deleting non-replaceable checkpoint ${name}`); 
        return true;
    }
    //console.log(`  Replacing checkpoint ${name} with ${replacement[0]} ` +
    //        `rotated by ${replacement[1]}`); 
    block.blockName[0] = replacement[0];
    block.rotation = (block.rotation + replacement[1]) % 4;
    return false;
}

function main() {
    const args = process.argv;
    const l = args.length;
    if (args.length != 4) {
        console.error(`Invalid arguments. Usage:
${args[0]} ${args[1]} 'Input.Challenge.Gbx' 'Output.Challenge.Gbx'`);
        return;
    }
    const gbx = loadGbxFile(args[2], true);
    cutBlocks(gbx, filter);
    saveGbxFile(args[3], gbx);
}

main();
