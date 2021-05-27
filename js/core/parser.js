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
}
