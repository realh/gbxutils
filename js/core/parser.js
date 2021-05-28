const {toString} = imports.byteArray;

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
    }

    resetLookBackStrings() {
        this.lookBackStrings = [];
    }

    char() {
        let o = this.offset++;
        return toString(this.bytes.slice(o, o + 1));
    }

    // If l is not given, it's read from the first 4 bytes
    string(l) {
        if (!l) {
            l = this.uint32();
        }
        let o = this.offset;
        this.offset += l;
        return toString(this.bytes.slice(o, this.offset));
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

    data(l) {
        const o = this.offset;
        this.offset += l;
        return this.bytes.slice(o, this.offset);
    }

    skip(l) {
        this.offset += l;
    }

    // See https://wiki.xaseco.org/wiki/ManiaPlanet_internals#Id
    lookbackstring() {
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
        if (flags == 0) {
            value = index;
            //console.log(`Numerical value ${value}`);
        } else if (flags == 3) {
            value = -1;
            //console.log(`Unassigned value ${value}`);
        } else if (index == 0) {
            value = this.string();
            this.lookBackStrings.push(value);
            //console.log(`New string ${value}`);
        } else {
            value = this.lookBackStrings[index - 1];
            //console.log(`Existing string[${index - 1}] ${value}`);
        }
        return [w, value];
    }

    meta() {
        const id = this.lookbackstring();
        const collection = this.lookbackstring();
        const author = this.lookbackstring();
        return {id, collection, author};
    }

    float() {
        const o = this.offset;
        this.offset += 4;
        const b = this.bytes.slice(o, this.offset);
        return new Float32Array(b.buffer);
    }

    vec2D() {
        const x = this.float();
        const y = this.float();
        return {x, y};
    }
}
