import {GbxBytesParser} from "./parser.js";
import {GbxChunk} from "./chunk.js";

export class GbxHeader {
    constructor(inp) {
        if (inp instanceof GbxBytesParser) {
            this.constructFromParser(inp);
        /*
        } else if (typeof inp == "string") {
            this.data = JSON.parse(inp);
        */
        } else {
            Object.assign(this, inp);
        }
    }

    constructFromParser(p) {
        this.magic = p.string(3);
        this.version = p.uint16();
        if (this.version >= 3) {
            this.format = p.char();
            this.refCompression = p.char();
            this.bodyCompression = p.char();
            if (this.version >= 4) {
                this.unknown = p.char();
            }
            this.classID = p.hex32();
            if (this.version >= 6) {
                this.userDataSize = p.uint32();
                this.parseUserData(p, this.userDataSize);
            }
            this.numNodes = p.uint32();
        }
    }

    parseUserData(p, userDataSize) {
        const o = p.offset;
        const end = o + userDataSize;
        this.numHeaderChunks = p.uint32();
        this.headerChunks = [];
        let dataSize = 0;
        for (let n = 0; n < this.numHeaderChunks; ++n) {
            const hdr = {
                chunkID: p.hex32(),
                chunkSize: p.uint32()
            }
            if (hdr.chunkSize & (1 << 31)) {
                hdr.chunkSize = hdr.chunkSize & 0x7fffffff;
                hdr.heavy = true;
            } else {
                hdr.heavy = false;
            }
            this.headerChunks.push(hdr);
            dataSize += hdr.chunkSize;
        }
        if (p.offset + dataSize != end) {
            throw Error(`Discrepancy between userDataSize ` +
                    `${userDataSize} and parsed data size ` +
                    `${p.offset - o + dataSize}`);
        }
        for (const e of this.headerChunks) {
            e.chunkData = GbxChunk.make(p, e.chunkID, e.chunkSize);
        }
    }

    toJSON() {
        let o = {
            magic: this.magic,
            version: this.version
        }
        if (this.version >= 3) {
            o.format = this.format;
            o.refCompression = this.refCompression;
            o.bodyCompression = this.bodyCompression;
            if (this.version >= 4) {
                o.unknown = this.unknown;
            }
            o.classID = this.classID;
            if (this.version >= 6) {
                o.userDataSize = this.userDataSize;
                o.numHeaderChunks = this.numHeaderChunks;
                o.headerChunks = this.headerChunks;
            }
            o.numNodes = this.numNodes;
        }
        return o;
    }
}
