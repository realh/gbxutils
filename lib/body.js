import {GbxObject, bytesToHex} from "./gbxobject.js";
import {GbxChunk, ChunkSize} from "./chunk.js";
import {GbxNode} from "./gbxnode.js";
import {Serializer} from "./serializer.js";
import {lzo1x} from "./lzo1x.js";
import {makeChunkSubclass} from "./basicchunk.js";

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

export class GbxBody extends GbxNode {
    compress() {
        const b = new Serializer();
        this.toBin(b);
        const lzo = {
            inputBuffer: b.bytes,
            outputBuffer: null
        }
        const result = lzo1x.compress(lzo);
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
