import {GbxObject, bytesToHex} from "./gbxobject.js";
import {GbxChunk, ChunkSize} from "./chunk.js";
import {Serializer} from "./serializer.js";
import {lzo1x} from "./lzo1x.js";

export class GbxRawBody extends GbxObject {
    constructor() {
        super(GbxRawBody.template);
    }

    toJSON() {
        const l = Math.min(this.data.length, 256);
        const leader = this.data.slice(0, l);
        return { data: `[${bytesToHex(leader)} ...]`, size: this.data.length };
    }

    toBin(b) {
        b.data(this.data);
    }

    compress() {
        return this;
    }

    static template = [["data", "data"]];
}

const SKIP = 0x534B4950;

export class GbxBody extends GbxObject {
    constructor() {
        super(GbxBody.template);
        this.chunks = [];
    }

    toBin(b) {
        b.data(this.data);
    }

    compress() {
        const b = new Serializer();
        this.toBin(b);
        const lzo = {
            inputBuffer: b.bytes,
            outputBuffer: null
        }
        const result = lzo1x.decompress(lzo);
        if (result !== 0 || !lzo.outputBuffer) {
            console.warn(`lzo compression failed: code ${result}`);
            return this;
        }
        const compressed = new GbxCompressedBody();
        compressed.uncompressedSize = b.bytes.length;
        compressed.compressedSize = lzo.outputBuffer.length;
        compressed.compressedData = lzo.outputBuffer;
        return compressed;
    }

    parseBinary(p) {
        this.chunks = [];
        while (true)
        {
            const chunkID = p.uint32();
            if (chunkID == 0xFACADE01) // no more chunks
            {
                return;
            }
            // The example in the wikis looks up some flags based on chunkID,
            // but it's a black box function, so I'll have to just ignore them
            // and wing it and hope that the skip field is always SKIP for
            // chunks that are supposed to have a skippable field.
            let skip = p.uint32();
            let chunkSize = undefined;
            if (skip == SKIP) {
                chunkSize = new ChunkSize(p.uint32());
            } else {
                skip = undefined;
                p.offset -= 4;
            }
            const chunk = GbxChunk.make(p, chunkID, chunkSize);
            chunk.skip = skip;
            this.chunks.push(chunk);
        }
    }

    static template = [["chunks", "Array"]];
}

export class GbxCompressedBody extends GbxObject {
    constructor() {
        super(GbxCompressedBody.template);
    }

    toJSON() {
        return {
            uncompressedSize: this.uncompressedSize,
            compressedSize: this.compressedSize,
            compressedData: "[...]",
            actualCompressedSize: this.compressedData.length
        };
    }

    compress() {
        return this;
    }

    static template = [
        ["uncompressedSize", "uint32"],
        ["compressedSize", "uint32"],
        ["compressedData", "data"]];
}
