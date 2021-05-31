import {GbxBytesParser} from "./parser.js";
import {GbxObject} from "./gbxobject.js";
import {ChunkSize, GbxChunk} from "./chunk.js";

export class GbxHeader extends GbxObject {
    constructor() {
        super(GbxHeader.template);
    }

    parseBinary(p) {
        super.parseBinary(p);
        if (this.version >= 3) {
            this.template = [["format", "char"],
                ["refCompression", "char"],
                ["bodyCompression", "char"]]
            if (this.version >= 4) {
                this.template.push(["unknown", "char"]);
            }
            this.template.push(["classID", "hex32"]);
            if (this.version >= 6) {
                this.template.push(["userDataSize", "uint32"]);
            }
            super.parseBinary(p);
            this.template.unshift(...GbxHeader.template);
            if (this.version >= 6) {
                this.parseUserData(p, this.userDataSize);
            }
            this.addTemplateAndValue(p, "numNodes", "uint32");
        }
        return this;
    }

    parseUserData(p, userDataSize) {
        const o = p.offset;
        const end = o + userDataSize;
        this.addTemplateAndValue(p, "numHeaderChunks", "uint32");
        if (this.numHeaderChunks <= 0) {
            return;
        }
        this.template.push(["headerChunks", "Array"]);
        this.headerChunks = [];
        let dataSize = 0;
        for (let n = 0; n < this.numHeaderChunks; ++n) {
            const hdr = {
                chunkID: p.hex32(),
                chunkSize: new ChunkSize(p.uint32())
            }
            this.headerChunks.push(hdr);
            dataSize += hdr.chunkSize.size();
        }
        if (p.offset + dataSize != end) {
            throw Error(`Discrepancy between userDataSize ` +
                    `${userDataSize} and parsed data size ` +
                    `${p.offset - o + dataSize}`);
        }
        for (let i = 0; i < this.headerChunks.length; ++i) {
            const e = this.headerChunks[i];
            this.headerChunks[i] = GbxChunk.make(p, e.chunkID, e.chunkSize);
            p.resetLookBackStrings();
        }
    }

    toBin(b) {
        const chunks = this.headerChunks;
        delete this.headerChunks;
        super.toBin(b);
        this.headerChunks = chunks;
        if (!this.numHeaderChunks) { return }
        let chunkData = [];
        for (const c of chunks) {
            // Use a temporary serializer so we can save each chunk's data
            // for later while getting its size now in case it's been updated
            const ser = new Serializer();
            c.toBin(ser);
            chunkData.push(ser.bytes);
            c.chunkSize = ser.bytes.length;
            b.uint32(c.chunkID);
            b.uint32(c.chunkSize);
            Serializer.resetLookBackStrings();
        }
        for (const c of chunkData) {
            b.data(c);
        }
    }

    static template = [["magic", "string", 3], ["version", "uint16"]];
}
