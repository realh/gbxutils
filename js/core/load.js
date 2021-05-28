import GLib from "gi://GLib";
import {GbxBytesParser} from "./parser.js";
import {GbxHeader} from "./header.js";
import {GbxReferenceTable} from "./reftable.js";
import * as allChunks from "../chunks/all.js";

export function loadGbx(filename) {
    const [success, bytes] = GLib.file_get_contents(filename);
    if (!success) {
        throw Error(`Unable to load ${filename}`);
    }
    let parser = new GbxBytesParser(bytes);
    const header = new GbxHeader();
    header.parseBinary(parser);
    const refTable = new GbxReferenceTable();
    refTable.parseBinary(parser);
    return {header, refTable};
}
