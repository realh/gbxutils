import {loadGbxFile, saveGbxFile} from "../lib/gbxfile.js";

const args = process.argv;
const gbx = loadGbxFile(args[2]);

saveGbxFile(args[3], gbx);
