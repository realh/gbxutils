import {loadGbx} from "../lib/load.js";
import {saveText} from "../lib/loadsave.js";
const byteArray = imports.byteArray;

// gjs has a global log and no console
if (!globalThis.console) {
    globalThis.console = { log, warn: (s) => { log("Warning: " + s); } }
}

const gbx = loadGbx(ARGV[0]);
const s = JSON.stringify(gbx, null, 2);
saveText(ARGV[1], s);
