import GLib from "gi://GLib";
const byteArray = imports.byteArray;

export function loadBinary(filename) {
    // success is always true because failure results in an exception
    const [success, bytes] = GLib.file_get_contents(filename);
    return bytes;
}

export function saveBinary(filename, b) {
    GLib.file_set_contents(filename, b);
}

export function saveText(filename, s) {
    GLib.file_set_contents(filename, byteArray.fromString(s));
}

export const bytesToString = byteArray.toString;
export const bytesFromString = byteArray.fromString;
