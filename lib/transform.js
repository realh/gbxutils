import {loadGbxFile, saveGbxFile} from "../lib/gbxfile.js";

// A convenience function for writing your own scripts. args can be passed
// directly from process.argv, assuming it takes the usual form of
// ["node", "script", "input_file.gbx", "output_file.gbx"]. 
// The supplied userTransform function takes a parsed GbxFile object.
export function runUserTransform(args, userTransform) {
    const gbx = loadGbxFile(args[2], true);
    userTransform(gbx);
    saveGbxFile(args[3], gbx);
}

// A convenience function around the convenience function. Calls
// runUserTransform with args from process.argv
export function userTransformMain(userTransform) {
    const args = process.argv;
    const l = args.length;
    if (args.length != 4) {
        console.error(`Invalid arguments. Usage:
${args[0]} ${args[1]} 'Input.Challenge.Gbx' 'Output.Challenge.Gbx'`);
        return;
    }
    runUserTransform(args, userTransform);
}
