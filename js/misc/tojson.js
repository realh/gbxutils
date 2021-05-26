import GLib from "gi://GLib";
import {loadGbx} from "../core/load.js";
const byteArray = imports.byteArray;

// gjs has a global log and no console
if (!globalThis.console) {
    globalThis.console = { log }
}

const gbx = loadGbx(ARGV[0]);
const s = JSON.stringify(gbx, null, 2);
const bytes = byteArray.fromString(s);
if (!GLib.file_set_contents(ARGV[1], bytes)) {
    throw Error(`Unable to write to ${ARGV[1]}`);
}
