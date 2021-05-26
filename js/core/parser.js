const {toString} = imports.byteArray;

export class Hex {
    constructor(value) {
        this.value = value;
    }

    toJSON() {
        return this.value.toString(16);
    }
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
        // Bitwise operators seem to cause the result to be signed int32
        return this.bytes[o] + (this.bytes[o + 1] * 0x100) +
            (this.bytes[o + 2] * 0x10000) + (this.bytes[o + 3] * 0x1000000);
    }

    hex32() {
        return new Hex(this.uint32());
    }

    bool() {
        return this.uint32() != 0;
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
