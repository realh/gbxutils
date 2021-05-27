import {GbxObject} from "./gbxobject.js";
import {bytesToUint32, Hex, Hex32} from "./parser.js";

export class GbxChunk extends GbxObject {
    constructor(template, name, id, size) {
        super(template);
        this.chunkName = name;
        this.chunkID = id;
        this.chunkSize = size;
        this.concrete = GbxChunk.registry.has(this.chunkID);
    }

    parseBinary(p) {
        if (this.concrete) {
            super.parseBinary(p);
        } else {
            this.data = p.data(size);
        }
    }

    toJSON() {
        if (this.concrete) {
            const d = {
                chunkName: this.chunkName,
                chunkID: this.chunkID,
                chunkSize: this.chunkSize
            }
            Object.assign(d, super.toJSON());
            return d;
        }
        const d = this.data;
        let data = [];
        let n = 0;
        for (n = 0; n < 8 && n + 4 <= this.chunkSize; n += 4) {
            data.push(new Hex32(bytesToUint32(d, n)));
        }
        if (this.chunkSize - n == 2 || this.chunkSize - n == 1) {
            data.push(new Hex(d[n] + (d[n + 1] * 0x100)), 16);
            n += 2;
        }
        if (this.chunkSize - n == 1) {
            data.push(new Hex(d[n]));
            ++n;
        }
        data = data.map(v => new Hex(v));
        if (n < this.chunkSize) {
            data.push("...");
        }
        return {
            chunkID: this.chunkID,
            chunkSize: this.chunkSize,
            data
        }
    }

    // A map of constructors of GbxChunk subclasses keyed by chunkID. Each
    // constructor will take parameters (id, size). It should additionally pass
    // its own template and name to its super constructor.
    static registry = new Map();
}
