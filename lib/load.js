import {GbxBytesParser} from "./parser.js";
import {GbxHeader} from "./header.js";
import {GbxReferenceTable} from "./reftable.js";
import {GbxBody, GbxCompressedBody} from "./body.js";
import {loadBinary} from "./loadsave.js";
import {lzo1x} from "./lzo1x.js";
import * as allChunks from "./chunks/all.js";

export function loadGbx(filename) {
    const bytes = loadBinary(filename);
    let parser = new GbxBytesParser(bytes);
    const header = new GbxHeader();
    header.parseBinary(parser);
    const refTable = new GbxReferenceTable();
    refTable.parseBinary(parser);
    let body;
    if (header.bodyCompression == 'C') {
        const lzo = {
            inputBuffer: bytes.slice(parser.offset),
            outputBuffer: null
        }
        const result = lzo1x.decompress(lzo);
        if (result !== 0) {
            console.log(`lzo decompression failed: code ${result}`);
        }
        if (result === 0 && lzo.outputBuffer) {
            parser.bytes = lzo.outputBuffer;
            parser.offset = 0;
            body = loadBody(parser);
        } else {
            body = new GbxCompressedBody();
            body.parseBinary(parser);
        }
    } else {
        body = loadBody(parser);
    }
    return {header, refTable, body};
}

function loadBody(parser) {
    return new GbxBody().parseBinary(parser);
}
