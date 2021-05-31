import {readFileSync, writeFileSync} from "fs";
const byteArray = imports.byteArray;

export const loadBinary = readFileSync;
export const saveBinary = writeFileSync;
export const saveText = writeFileSync;

let enc = null;
let dec = null;

export function bytesToString(b) {
    if (!dec) {
        dec = new TextDecoder();
    }
    return dec.decode(b)
}

export function bytesFromString(s) {
    if (!enc) {
        enc = new TextEncoder();
    }
    return enc.encode(b)
}
