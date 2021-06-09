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
            const uncompressedSize = parser.uint32();
            let compressedSize = parser.uint32();
            const l = parser.bytes.length - parser.offset;
            if (compressedSize != l) {
                console.warn(`Compressed body is supposed to occupy ` +
                        `${compressedSize} bytes, but there are ${l} bytes ` +
                        `in this part of the file`);
                if (compressedSize > l) {
                    compressedSize = l;
                }
            }
            const o = parser.offset;
            const lzo = {
                inputBuffer: parser.data(compressedSize),
                outputBuffer: null
            }
            const result = lzo1x.decompress(lzo);
            if (result === 0 && lzo.outputBuffer) {
                if (lzo.outputBuffer.length != uncompressedSize) {
                    console.warn(`Decompressed body is supposed to occupy ` +
                            `${uncompressedSize} bytes, but actually ` +
                            `occupies ${lzo.outputBuffer.length}`);
                }
                parser.bytes = lzo.outputBuffer;
                parser.offset = 0;
                this.body = loadBody(parser);
                //this.body = new GbxRawBody();
                //this.body.parseBinary(parser);
            } else {
                console.warn(`lzo decompression failed: code ${result}`);
                this.body = new GbxCompressedBody();
                parser.offset = o;
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
        let body = this.body;
        if (this.header.bodyCompression == 'C') {
            body = body.compress();
            if (body instanceof GbxBody) {
                // Compression failed
                this.header.bodyCompression == 'U';
            }
        }
        this.header.toBin(b);
        this.refTable.toBin(b);
        body.toBin(b);
    }

    tm2ToNF() {
        this.header.tm2ToNF();
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
