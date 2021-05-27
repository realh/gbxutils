import {GbxObject} from "./gbxobject.js";
import {bytesToUint32} from "./parser.js";

export class ChunkSize {
    constructor(value) {
        this.value = value;
    }

    size() {
        return this.value & 0x7fffffff;
    }

    heavy() {
        return (this.value & 0x80000000) ? true : false;
    }

    toJSON() {
        return {
            size: this.size(),
            heavy: this.heavy()
        }
    }
}

export class GbxChunk extends GbxObject {
    constructor(template, name, id, size) {
        super(template);
        this.chunkName = name;
        this.chunkID = id;
        this.chunkSize = size;
        this.concrete = GbxChunk.registry.has(id);
    }

    parseBinary(p) {
        if (this.concrete) {
            super.parseBinary(p);
        } else {
            this.data = p.data(this.chunkSize.size());
        }
        return this;
    }

    toJSON() {
        if (this.concrete) {
            const d = {
                chunkName: this.chunkName,
                chunkID: this.chunkID.toString(16),
                chunkSize: this.chunkSize
            }
            Object.assign(d, super.toJSON());
            return d;
        }
        const d = this.data;
        let data = [];
        let n = 0;
        const sz = this.chunkSize.size();
        for (n = 0; n < 8 && n + 4 <= sz; n += 4) {
            data.push(bytesToUint32(d, n));
        }
        if (sz - n == 2 || sz - n == 1) {
            data.push(d[n] + (d[n + 1] * 0x100));
            n += 2;
        }
        if (sz - n == 1) {
            data.push(d[n]);
            ++n;
        }
        data = data.map(v => v.toString(16));
        if (n < sz) {
            data.push("...");
        }
        return {
            chunkID: this.chunkID.toString(16),
            chunkSize: this.chunkSize,
            data
        }
    }

    static make(p, id, size) {
        const ctor = this.registry[id];
        let chunk;
        if (ctor) {
            chunk = new ctor(id, size);
        } else {
            chunk = new GbxChunk([], undefined, id, size);
        }
        chunk.parseBinary(p);
        return chunk;
    }

    // A map of constructors of GbxChunk subclasses keyed by chunkID. Each
    // constructor will take parameters (id, size). size is a ChunkSize object,
    // not a number. It should additionally pass its own template and name to
    // its super constructor.
    static registry = new Map();
}
