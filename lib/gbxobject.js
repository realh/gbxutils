// A GbxObject is an object that can be stored in a gbx file, forming the base
// class for chunks and the header etc. This provides basic methods for
// describing objects with templates and for parsing and generating gbx binary
// data.

const pow32 = Math.pow(2, 32);
const pow64 = Math.pow(2, 64);
const pow96 = Math.pow(2, 96);

// Represents n as 8-bit hex with leading 0s
export function hex08(n) {
    return `0${n.toString(16)}`.slice(-2);
}

// Represents n as 16-bit hex with leading 0s
export function hex016(n) {
    return `000${n.toString(16)}`.slice(-4);
}

// Represents n as 32-bit hex with leading 0s
export function hex032(n) {
    return `0000000${n.toString(16)}`.slice(-8);
}

// Represents v, a LE tuple of uint32, as hex
export function bigHex(v) {
    let s = "";
    for (const n of v) {
        s = hex032(n) + s;
    }
    return s;
}

export function bytesToHex(bytes, joiner = ' ') {
    return Array.from(bytes).map(b => hex08(b)).join(joiner);
}

export class GbxObject {
    constructor(template, name) {
        this.template = template;
        this.name = name || this.constructor.name;
        this.verbose = false;
    }

    // By default the template should be a reference to a static member. This
    // method replaces it with a copy so that it can be customised per-instance.
    copyTemplate() {
        this.template = [...this.template];
    }

    // p is a GbxBytesParser
    parseBinary(p) {
        this.totalRead = 0;
        for (const kta of this.template) {
            this.parseField(p, kta);
        }
        return this;
    }

    parseField(p, kta) {
        const k = kta[0];
        const t = kta[1];
        const o = p.offset;
        let tn;
        try {
            if (typeof t == "string") {
                if (!p[t]) {
                    throw Error(`Can't parse type '${t}'`);
                }
                if (kta.length > 2) {
                    this[k] = p[t](...kta.slice(2));
                } else {
                    this[k] = p[t]();
                }
                tn = t;
            } else {
                this[k] = new t();
                this[k].parseBinary(p);
                tn = t.name;
            }
        } catch (err) {
            console.error(`GbxObject.parseBinary error for template ` +
                    `[${kta}] of chunk ${this.name}`);
            throw err;
        }
        if (this.verbose) {
            const l = p.offset - o;
            this.totalRead += l;
            console.log(`  Read ${k}:${tn} | ${l}, ${this.totalRead}`);
        }
    }

    // This is useful when the template needs to be modified on the fly
    // depending on previous values.
    addTemplateAndValue(p, name, type, ...args) {
        const kta = [name, type, ...args];
        this.template.push(kta);
        this.parseField(p, kta);
    }

    // Note that ints > 32-bit are stored as tuples of ints (LE) to preserve
    // precision and represented as hex here.
    toJSON() {
        let o = {};
        for (const [k, t] of this.template) {
            let v = this[k];
            switch (t) {
            case "hex16":
                v = hex016(v);
                break;
            case "hex32":
                v = hex032(v);
                break;
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
                v = `lookback('${v[0]}', ${v[1]})`;
            }
            o[k] = v;
        }
        return o;
    }

    // b is a Serializer
    toBin(b) {
        this.totalWritten = 0;
        for (const tp of this.template) {
            let k = tp[0];
            let v = this[k];
            let t = tp[1];
            let a = tp.slice(2);
            const o = b.bytes.length;
            let tn;
            try {
                if (typeof t == "string") {
                    b[t](v, ...a);
                    tn = t;
                } else {
                    t.toBin(b);
                    tn = t.name;
                }
            } catch (err) {
                console.error(err);
                throw Error(`Trying to write ${this.name}.${k}: ${t}`);
            }
            if (this.verbose) {
                const l = b.bytes.length - o;
                this.totalWritten += l;
                console.log(`  Wrote ${k}:${tn} | ${l}, ${this.totalWritten}`);
            }
        }
    }

    // Override where necessary to convert TM2 Stadium format to TMNF
    tm2ToNF() {
    }

    deleteFromTemplate(keys, version) {
        console.log(`Downgrading ${this.name} from version ` +
                `${this.version} to ${version}`);
        if (version && this.version <= version) { return; }
        if (version) { this.version = version; }
        for (const key of keys) {
            let i = this.template.findIndex(a => a[0] == key);
            if (i != -1) {
                this.template.splice(i, 1);
                delete this[key];
                console.log(`  Removed ${key}`);
            }
        }
        this.sizeChangeIsHarmless = true;
    }

    // Finds the template entry for a given key
    findTemplate(key) {
        const template = this.template.find(t => t[0] == key);
        if (!template) {
            console.error(`${this.name} has no template key ${key}`);
        }
        return template;
    }

    // Looks up entry for key in this object's template, checks it's an array,
    // and increases the number of elements by inc if the length is stored in
    // the template
    addArrayTemplate(key, inc) {
        const template = this.findTemplate(key);
        if (!template) { return; }
        if (template[1] != "array") {
            const t = (typeof template[1] == "string") ? template[1] : t.name;
            throw Error(`${this.name}.${t} is not an array`);
        }
        if (template.length >= 4) {
            template[3] += inc;
        } else {
            console.log(`${this.name}.${t} template does not hold length`);
        }
    }
}
