import {GbxObject, hex032} from "./gbxobject.js";
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
        super(template, name);
        this.chunkName = name;
        this.chunkID = id;
        this.chunkSize = size;
        this.concrete = GbxChunk.registry.has(id);
        // If a chunk has been edited or it may change size during
        // decoding/encoding (xml can do this due to whitespace),
        // set this to true
        this.sizeChangeIsHarmless = false;
    }

    // This checks that the amount of data read matches chunkSize. It calls
    // doParseBinary, which is the method that needs to be overriden to
    // customise the parsing.
    parseBinary(p) {
        let o = p.offset;
        this.doParseBinary(p);
        o = p.offset - o;
        if (this.chunkSize && (o != this.chunkSize.size())) {
            throw Error(`Read ${o} bytes for chunk '${this.chunkName}'; ` +
                    `does not match expected size ${this.chunkSize.size()}`);
        /*
        } else if (this.chunkSize) {
            console.log(`Read ${o} bytes for chunk '${this.chunkName}'; ` +
                    `matches expected size ${this.chunkSize.size()}`);
        } else {
            console.log(`Read ${o} bytes for chunk '${this.chunkName}'; ` +
                    `chunkSize mot known in advance`);
        */
        }
        return this;
    }

    doParseBinary(p) {
        if (this.concrete) {
            super.parseBinary(p);
        } else {
            this.data = p.data(this.chunkSize.size());
        }
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
        if (sz - n == 2 || sz - n == 3) {
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
            data,
            skip: hex032(this.skip)
        }
    }

    static make(id, size) {
        const ctor = this.registry.get(id);
        let chunk;
        if (ctor) {
            chunk = new ctor(id, size);
        } else {
            if (size === undefined) {
                throw Error(`Can't load chunk with unrecognised id ` +
                        `${id.toString(16)} without knowing size`);
            }
            chunk = new GbxChunk([], undefined, id, size);
        }
        return chunk;
    }

    // A map of constructors of GbxChunk subclasses keyed by chunkID. Each
    // constructor will take parameters (id, size). size is a ChunkSize object,
    // not a number. It should additionally pass its own template and name to
    // its super constructor.
    static registry = new Map();
}
