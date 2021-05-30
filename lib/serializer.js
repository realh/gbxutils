import {bytesFromString} from "./loadsave.js";

export class Serializer {
    constructor() {
        this.data = new Uint8Array();
    }

    data(a) {
        const a = this.bytes;
        this.bytes = new Uint8Array(a.length + b.length);
        this.bytes.set(a, 0);
        this.bytes.set(b, a.length);
        return this;
    }

    byte(b) {
        const a = new Uint8Array(1);
        a[0] = b;
        return this.data(a);
    }

    uint16(i) {
        const b = new Uint8Array(2);
        b[0] = i & 0xff;
        b[1] = (i >> 8) & 0xff;
        return this.data(b);
    }

    uint32(i) {
        const b = new Uint8Array(4);
        // shift before mask means it doesn't matter whether shift is
        // arithmetic or logical
        b[0] = i & 0xff;
        b[1] = (i >> 8) & 0xff;
        b[2] = (i >> 16) & 0xff;
        b[3] = (i >> 24) & 0xff;
        return this.data(b);
    }

    uint64(i) {
        return this.uint32(i[0]).uint32(i[1]);
    }

    uint128(i) {
        return this.uint32(i[0]).uint32(i[1]).uint32(i[2]).uint32(i[3]);
    }

    hex32(i) {
        return this.uint32(i);
    }

    bool(b) {
        return this.uint32(b ? 1 : 0);
    }

    string(s, l) {
        if (!l) {
            this.uint32(s.length);
        }
        this.data(bytesFromString(s));
    }

    // s may be a string or a number (uint32)
    lookbackstring(s) {
        if (typeof s == "number") {
            if (s == -1) {
                this.uint32(0xffffffff);
            } else {
                this.uint32(s);
            }
            return;
        }
        const i = Serializer.lookBackStrings.indexOf(s);
        this.uint32(i + 1);
        if (i == -1) {
            this.string(s);
        }
    }

    meta(m) {
        return this.lookbackstring(m.id).lookbackstring(m.collection).
            lookbackstring(m.author);
    }

    xml(x) {
        return this.string(x.toXmlString());
    }

    float(f) {
        const fa = new Float32Array(1);
        fa[0] = f;
        return this.data(new Uint8Array(fa.buffer));
    }

    vec2D(v) {
        return this.float(v.x).float(v.y);
    }

    static lookBackStrings = [];

    static resetLookBackStrings() {
        this.lookBackStrings = [];
    }

}
