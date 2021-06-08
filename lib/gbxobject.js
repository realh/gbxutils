// A GbxObject is an object that can be stored in a gbx file, forming the base
// class for chunks and the header etc. This provides basic methods for
// describing objects with templates and for parsing and generating gbx binary
// data.

const pow32 = Math.pow(2, 32);
const pow64 = Math.pow(2, 64);
const pow96 = Math.pow(2, 96);

// Represents n as 8-bit hex with leading 0s
function hex08(n) {
    return `0${n.toString(16)}`.slice(-2);
}

// Represents n as 32-bit hex with leading 0s
function hex032(n) {
    return `0000000${n.toString(16)}`.slice(-8);
}

// Represents v, a LE tuple of uint32, as hex
function bigHex(v) {
    let s = "";
    for (const n of v) {
        s = hex032(n) + s;
    }
    return s;
}

export function bytesToHex(bytes) {
    return Array.from(bytes).map(b => hex08(b)).join(' ');
}

export class GbxObject {
    constructor(template) {
        this.template = template;
        this.name = this.constructor.name;
    }

    // By default the template should be a reference to a static member. This
    // method replaces it with a copy so that it can be customised per-instance.
    copyTemplate() {
        this.template = [...this.template];
    }

    // p is a GbxBytesParser
    parseBinary(p) {
        for (const kta of this.template) {
            const k = kta[0];
            const t = kta[1];
            /*
            let o;
            if (this.name == "Common") {
                o = p.offset;
            }
            */
            if (!p[t]) {
                throw Error(`Can't parse type '${t}'`);
            }
            if (kta.length > 2) {
                this[k] = p[t](...kta.slice(2));
            } else {
                this[k] = p[t]();
            }
            /*
            if (this.name == "Common" && t != "lookbackstring") {
                const b = p.bytes.slice(o, p.offset);
                console.log(` R: ${k} : ${t} : ${this[k]} : ${bytesToHex(b)}`);
            }
            */
        }
        return this;
    }

    // This is useful when the template needs to be modified on the fly
    // depending on previous values.
    addTemplateAndValue(p, name, type, ...args) {
        /*
        let o;
        if (this.name == "Common") {
            o = p.offset;
        }
        */
        this.template.push([name, type, ...args]);
        if (args !== undefined) {
            this[name] = p[type](...args);
        } else {
            this[name] = p[type]();
        }
        /*
        if (this.name == "Common") {
            const b = p.bytes.slice(o, p.offset);
            console.log(` R: ${name} : ${type} : ${this[name]} : ` +
                    `${bytesToHex(b)}`);
        }
        */
    }

    // Note that ints > 32-bit are stored as tuples of ints (LE) to preserve
    // precision and represented as hex here.
    toJSON() {
        let o = {};
        for (const [k, t] of this.template) {
            let v = this[k];
            switch (t) {
            case "hex32":
            case "classID":
            case "chunkID":
                v = v.toString(16);
                break;
            case "meta":
                v = {
                    id: v.id,
                    collection: v.collection,
                    author: v.author
                }
                break;
            case "uint64":
            case "uint128":
                v = bigHex(v);
                break;
            case "lookbackstring":
                v = `"lookback('${v[0]}', ${v[1]})"`;
            }
            o[k] = v;
        }
        return o;
    }

    // b is a Serializer
    toBin(b) {
        /*
        let o0;
        if (this.name == "Common") {
            console.log("Serializing Common");
            o0 = b.bytes.length;
        }
        */
        for (const tp of this.template) {
            let k = tp[0];
            let v = this[k];
            let t = tp[1];
            let a = tp.slice(2);
            let o;
            if (this.name == "Common") {
                o = b.bytes.length;
            }
            try {
                if (t == "Array") {
                    for (const n of v) {
                        n.toBin(v);
                    }
                } else {
                    b[t](v, ...a);
                }
                /*
                if (this.name == "Common") {
                    const bts = b.bytes.slice(o, b.bytes.length);
                    console.log(` W: ${k} : ${t} : ${v} : ${bytesToHex(bts)}`);
                }
                */
            } catch (err) {
                console.error(err);
                throw Error(`Trying to write ${this.name}.${k} = ${v}: ${t}`);
            }
        }
        /*
        if (this.name == "Common") {
            console.log(
                    `Completed Common write of ${b.bytes.length - o0} bytes`);
        }
        */
    }

    // Override where necessary to convert TM2 Stadium format to TMNF
    tm2ToNF() {
    }

    deleteFromTemplate(keys, version) {
        if (version && this.version <= version) { return; }
        if (version) { this.version = version; }
        for (const key of keys) {
            let i = this.template.findIndex(a => a[0] == key);
            if (i != -1) {
                this.template.splice(i, 1);
                delete this[key];
            }
        }
        this.sizeChangeIsHarmless = true;
    }

}
