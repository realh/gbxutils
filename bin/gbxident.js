import {loadGbxFile, saveGbxFile} from "../lib/gbxfile.js";

function main() {
    const args = process.argv;
    const l = args.length;
    if (args.length != 4) {
        console.error(`Invalid arguments. Usage:
${args[0]} ${args[1]} 'Input.Challenge.Gbx' 'Output.Challenge.Gbx'`);
        return;
    }
    const gbx = loadGbxFile(args[2], true);
    saveGbxFile(args[3], gbx);
}

main();
