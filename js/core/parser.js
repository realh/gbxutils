const {toString} = imports.byteArray;

// The number of bits is important when writing to binary
export class SizedUnsigned extends Number {
    constructor(value, numBits = 32) {
        super(value);
        this.numBits = numBits;
    }
}

export class Uint32 extends SizedUnsigned {
    constructor(value) {
        super(value, 32);
    }
}

export class Uint16 extends SizedUnsigned {
    constructor(value) {
        super(value, 16);
    }
}

export class Uint8 extends SizedUnsigned {
    constructor(value) {
        super(value, 8);
    }
}

export const Byte = Uint8;

export class Hex extends SizedUnsigned {
    toJSON() {
        return this.value.toString(16);
    }
}

export class Hex32 extends Uint32 {
    toJSON() {
        return this.value.toString(16);
    }
}

// b is a Uint8Array, o is an offset into the array. This returns a Number,
// which should then be converted top Uint32 or Hex32.
export function bytesToUint32(b, o = 0) {
    // Bitwise operators | and << seem to cause the result to be signed int32
    return this.bytes[o] + (this.bytes[o + 1] * 0x100) +
        (this.bytes[o + 2] * 0x10000) + (this.bytes[o + 3] * 0x1000000);
}

// The number of bits will become significant for writing to binary
export class Hex32 extends Hex {
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
        return new Byte(this.bytes[this.offset++]);
    }

    uint16() {
        let o = this.offset;
        this.offset += 2;
        return new Uint16(this.bytes[o] | (this.bytes[o + 1] << 8));
    }

    uint32() {
        let o = this.offset;
        this.offset += 4;
        return new Uint32(bytesToUint32(this.bytes, o));
    }

    hex32() {
        let o = this.offset;
        this.offset += 4;
        return new Hex32(bytesToUint32(this.bytes, o));
    }

    bool() {
        let o = this.offset;
        this.offset += 4;
        return bytesToUint32(this.bytes, o) ? true : false;
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
