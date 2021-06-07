import {GbxBytesParser} from "./parser.js";
import {GbxObject} from "./gbxobject.js";
import {ChunkSize, GbxChunk} from "./chunk.js";
import {Serializer, bytesFromUint32} from "./serializer.js";

export class GbxHeader extends GbxObject {
    constructor() {
        super(GbxHeader.template);
    }

    parseBinary(p) {
        let o = p.offset;
        super.parseBinary(p);
        o = p.offset - o;
        if (this.version >= 3) {
            this.template = [["format", "char"],
                ["refCompression", "char"],
                ["bodyCompression", "char"]];
            o += 3;
            if (this.version >= 4) {
                this.template.push(["unknown", "char"]);
                o++;
            }
            this.template.push(["classID", "hex32"]);
            o += 4;
            if (this.version >= 6) {
                this.template.push(["userDataSize", "uint32"]);
                this.userDataSizeOffset = o;
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
            /*
            if (e.chunkID == 0x3043003) {
                console.log(`Header reading Common chunk size ` +
                        `${e.chunkSize.size()}`);
            }
            */
            this.headerChunks[i] = GbxChunk.make(p, e.chunkID, e.chunkSize);
            p.resetLookBackStrings();
        }
    }

    toBin(b) {
        let sizeChange = 0;
        // Temporarily remove headerChunks and numNodes from template
        const hci = this.template.findIndex(t => t[0] == "headerChunks");
        let tail;
        if (hci != -1) {
            tail = this.template.splice(hci, this.template.length - hci);
        }
        super.toBin(b);
        if (hci != -1) {
            this.template.splice(hci, 0, ...tail);
        }
        if (this.numHeaderChunks) {
            let chunkData = [];
            for (const c of this.headerChunks) {
                // Use a temporary serializer so we can save each chunk's data
                // for later while getting its size now in case it's been
                // updated
                const ser = new Serializer();
                c.toBin(ser);
                if (c.chunkSize.size() != ser.bytes.length) {
                    sizeChange += ser.bytes.length - c.chunkSize.size();
                    if (!c.sizeChangeIsHarmless) {
                        console.warn(`Expected header chunk ${c.name} to be ` +
                                `${c.chunkSize.size()} bytes, ` +
                                `got ${ser.bytes.length}`);
                    }
                }
                chunkData.push(ser.bytes);
                const heavy = c.chunkSize.heavy();
                c.chunkSize.value = ser.bytes.length;
                if (heavy) {
                    c.chunkSize.value |= 0x80000000;
                }
                b.uint32(c.chunkID);
                b.uint32(c.chunkSize.value);
                Serializer.resetLookBackStrings();
            }
            for (const c of chunkData) {
                b.data(c);
            }
        }
        if (tail.length == 2) {
            b.uint32(this.numNodes);
        }
        if (sizeChange && this.userDataSizeOffset) {
            const n = this.userDataSize + sizeChange;
            console.log(
                    `Amending userDataSize from ${this.userDataSize} to ${n}`);
            const bytes = bytesFromUint32(n);
            b.bytes.set(bytes, this.userDataSizeOffset);
        }
    }

    tm2ToNF() {
        for (let i = 0; i < this.numHeaderChunks; ++i) {
            let chunk = this.headerChunks[i];
            if (chunk.chunkID == 0x3043008) {
                // TMNF doesn't have "Author" chunks
                this.headerChunks.splice(i, 1);
                --i;
            } else {
                chunk.tm2ToNF();
            }
        }
    }

    static template = [["magic", "string", 3], ["version", "uint16"]];
}
