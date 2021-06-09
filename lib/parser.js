import {GbxXml} from "./xml.js";
import {bytesToString} from "./loadsave.js";
import {bytesToHex} from "./gbxobject.js";
import {NodeRef} from "./gbxnode.js";

// If we try to derive classes from Number, they can't be used as numbers
// (arithmetic, comparison etc), so these are pseudo-classes which add
// properties and/or methods directly to the instance instead of using a new
// prototype.

// b is a Uint8Array, o is an offset into the array. This returns a Number,
// which should then be converted top Uint32 or Hex32.
export function bytesToUint32(b, o = 0) {
    // Bitwise operators | and << seem to cause the result to be signed int32
    return b[o] + (b[o + 1] * 0x100) +
        (b[o + 2] * 0x10000) + (b[o + 3] * 0x1000000);
}

export class GbxBytesParser {
    // bytes is a Uint8Array
    constructor(bytes) {
        this.bytes = bytes;
        this.offset = 0;
        this.lookBackStrings = [];
        this.nodeList = new Map();
    }

    resetLookBackStrings() {
        this.lookBackStrings = [];
    }

    char() {
        let o = this.offset++;
        return bytesToString(this.bytes.slice(o, o + 1));
    }

    // If l is not given, it's read from the first 4 bytes
    string(l) {
        if (!l) {
            l = this.uint32();
        }
        let o = this.offset;
        this.offset += l;
        return bytesToString(this.bytes.slice(o, this.offset));
    }

    byte() {
        return this.bytes[this.offset++];
    }

    uint16() {
        let o = this.offset;
        this.offset += 2;
        return this.bytes[o] | (this.bytes[o + 1] << 8);
    }

    uint32() {
        let o = this.offset;
        this.offset += 4;
        return bytesToUint32(this.bytes, o);
    }

    uint64() {
        let l = this.uint32();
        let b = this.uint32();
        return [l, b];
    }

    uint128() {
        let w0 = this.uint32();
        let w1 = this.uint32();
        let w2 = this.uint32();
        let w3 = this.uint32();
        return [w0, w1, w2, w3];
    }

    hex32() {
        return this.uint32();
    }

    bool() {
        return this.uint32() ? true : false;
    }

    // l can be omitted or negative to read to the end of the data
    data(l) {
        if (!l || l < 0) {
            l = this.bytes.length - this.offset;
        }
        const o = this.offset;
        this.offset += l;
        return this.bytes.slice(o, this.offset);
    }

    skip(l) {
        this.offset += l;
    }

    // See https://wiki.xaseco.org/wiki/ManiaPlanet_internals#Id
    lookbackstring() {
        const o = this.offset;
        if (!this.lookBackStrings.length) {
            const version = this.uint32();
            if (version != 3) {
                throw Error(`First lookbackstring in a chunk should have ` +
                        `version 3, got ${version}`);
            }
            //console.log(`lookback string version ${version}`);
        }
        const w = this.uint32();
        const flags = ((w & 0x80000000) ? 2 : 0) + ((w & 0x40000000) ? 1 : 0)
        let index = w & 0x3fffffff;
        if (index == 0x3fffffff) { index = -1; }
        /*
        console.log(
          `lookbackstring word ${w} (0x${w}): flags ${flags}, index ${index}`);
        */
        let value;
        let orig = false;
        if (flags == 0) {
            value = index;
            //console.log(`Numerical value ${value}`);
        } else if (flags == 3) {
            value = -1;
            //console.log(`Unassigned value ${value}`);
        } else if (index == 0) {
            value = this.string();
            this.lookBackStrings.push(value);
            orig = true;
            //console.log(`New string ${value}`);
        } else {
            value = this.lookBackStrings[index - 1];
            //console.log(`Existing string[${index - 1}] ${value}`);
        }
        const b = this.bytes.slice(o, this.offset);
        const l = this.offset - o;
        /*
        console.log(`  R: lookbackstring(${orig}) : ${value},${flags} : ` +
                `${l} : ${bytesToHex(b)}`);
        */
        return [value, flags];
    }

    meta() {
        const id = this.lookbackstring();
        const collection = this.lookbackstring();
        const author = this.lookbackstring();
        return {id, collection, author};
    }

    xml() {
        const s = this.string();
        try {
            return new GbxXml().parse(s);
        } catch (err) {
            console.warn(`XML parse error: ${err}`);
            return s;
        }
    }

    float() {
        const o = this.offset;
        this.offset += 4;
        // Need a new Uint8Array to force offset to be word-aligned
        const b = new Uint8Array(4);
        b.set(this.bytes.slice(o, this.offset));
        const f = new Float32Array(b, 0, 4);
        return f[0];
    }

    // t must be a string corresponding to one of the other methods, otherwise
    // the object owning the array needs to parse each item itself. n is the
    // number of items.
    array(n, t) {
        let a = [];
        for (let i = 0; i < n; ++i) {
            a.push(this[t]());
        }
        return a;
    }

    vec2D() {
        const x = this.float();
        const y = this.float();
        return {x, y};
    }

    noderef() {
        const index = this.uint32();
        const n = new NodeRef(index, this.nodeList);
        n.parseBinary(this);
        return n;
    }
}
