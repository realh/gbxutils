import {loadGbxFile} from "../lib/gbxfile.js";
import {saveText} from "../lib/loadsave.js";

const args = process.argv;
const gbx = loadGbxFile(args[2]);
const s = JSON.stringify(gbx, null, 2);
saveText(args[3], s);
