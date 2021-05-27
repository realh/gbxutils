import {GbxBytesParser, Uint32} from "./parser.js";
import {GbxObject} from "./gbxobject.js";
import {GbxChunk} from "./chunk.js";

class HeaderChunkSize extends Uint32 {
    size() {
        return this & 0x7fffffff;
    }

    heavy() {
        return (this & 0x80000000) ? true : false;
    }

    toJSON() {
        return {
            size: this.size(),
            heavy: this.heavy()
        }
    }
}

export class GbxHeader extends GbxObject {
    constructor() {
        super(GbxHeader.template);
    }

    parseBinary(p) {
        super.parseBinary(p);
        this.version = p.uint16();
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
            this.numNodes = p.uint32();
        }
    }

    parseUserData(p, userDataSize) {
        const o = p.offset;
        const end = o + userDataSize;
        this.addTemplateAndValue(p, "numHeaderChunks", "uint32");
        if (this.numHeaderChunks <= 0)
            return;
        this.template.push(["headerChunks", "Array"]);
        this.headerChunks = [];
        let dataSize = 0;
        for (let n = 0; n < this.numHeaderChunks; ++n) {
            const hdr = {
                chunkID: p.hex32(),
                chunkSize: HeaderChunkSize(p.uint32())
            }
            this.headerChunks.push(hdr);
            dataSize += hdr.chunkSize.size();
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

    static template = [["magic", "string", 3], ["version", "uint16"]];
}
