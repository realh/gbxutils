import {GbxObject} from "./gbxobject.js";
import {GbxBytesParser} from "./parser.js";
import {Serializer} from "./serializer.js";
import {GbxHeader} from "./header.js";
import {GbxReferenceTable} from "./reftable.js";
import {GbxBody, GbxCompressedBody, GbxRawBody} from "./body.js";
import {loadBinary, saveBinary} from "./loadsave.js";
import {lzo1x} from "./lzo1x.js";
import * as allChunks from "./chunks/all.js";

export class GbxFile extends GbxObject {
    constructor(decodeBody = true) {
        super([]);
        this.decodeBody = decodeBody;
    }

    parseBinary(parser) {
        this.header = new GbxHeader();
        this.header.parseBinary(parser);
        this.refTable = new GbxReferenceTable();
        this.refTable.parseBinary(parser);
        if (!this.decodeBody) {
            this.body = new GbxRawBody();
            this.body.parseBinary(parser);
        } else if (this.header.bodyCompression == 'C') {
            const lzo = {
                inputBuffer: parser.data(),
                outputBuffer: null
            }
            const result = lzo1x.decompress(lzo);
            if (result === 0 && lzo.outputBuffer) {
                parser.bytes = lzo.outputBuffer;
                parser.offset = 0;
                this.body = loadBody(parser);
            } else {
                console.log(`lzo decompression failed: code ${result}`);
                this.body = new GbxCompressedBody();
                this.body.parseBinary(parser);
            }
        } else {
            this.body = loadBody(parser);
        }
        return this;
    }

    toJSON() {
        return {header: this.header, refTable: this.refTable, body: this.body};
    }

    toBin(b) {
        this.header.toBin(b);
        this.refTable.toBin(b);
        this.body.toBin(b);
    }
}

function loadBody(parser) {
    return new GbxBody().parseBinary(parser);
}

export function loadGbxFile(filename, decodeBody = true) {
    const bytes = loadBinary(filename);
    const parser = new GbxBytesParser(bytes);
    return new GbxFile(decodeBody).parseBinary(parser);
}

export function saveGbxFile(filename, gbxFile) {
    const b = new Serializer();
    gbxFile.toBin(b);
    saveBinary(filename, b.bytes);
}
