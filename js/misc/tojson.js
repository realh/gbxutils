const {fromString} = imports.byteArray;
const {file_set_contents} = imports.gi.GLib;
const {loadGbx} = imports.core.load;

// gjs has a global log and no console
if (!globalThis.console) {
    globalThis.console = { log }
}

const gbx = loadGbx(ARGV[0]);
const s = JSON.stringify(gbx, null, 2);
const bytes = fromString(s);
if (!file_set_contents(ARGV[1], bytes)) {
    throw Error(`Unable to write to ${ARGV[1]}`);
}
