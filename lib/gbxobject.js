// A GbxObject is an object that can be stored in a gbx file, forming the base
// class for chunks and the header etc. This provides basic methods for
// describing objects with templates and for parsing and generating gbx binary
// data.

const pow32 = Math.pow(2, 32);
const pow64 = Math.pow(2, 64);
const pow96 = Math.pow(2, 96);

// Represents n as 32-bit hex with leading 0s
function hex032(n) {
    return `0000000${n}`.slice(-8);
}

// Represents v, a LE tuple of uint32, as hex
function bigHex(v) {
    let s = "";
    for (const n of v) {
        s = hex032(n) + s;
    }
    return s;
}

export class GbxObject {
    constructor(template) {
        this.template = template;
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
            if (kta.length > 2) {
                this[k] = p[t](...kta.slice(2));
            } else {
                this[k] = p[t]();
            }
        }
        return this;
    }

    // This is useful when the template needs to be modified on the fly
    // depending on previous values.
    addTemplateAndValue(p, name, type, ...args) {
        this.template.push([name, type]);
        if (args !== undefined) {
            this[name] = p[type](...args);
        } else {
            this[name] = p[type]();
        }
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
            case "lookbackstring":
                v = lookBackStringToJson(v);
                break;
            case "meta":
                v = {
                    id: lookBackStringToJson(v.id),
                    collection: lookBackStringToJson(v.collection),
                    author: lookBackStringToJson(v.author)
                }
                break;
            case "uint64":
            case "uint128":
                v = bigHex(v);
                break;
            }
            o[k] = v;
        }
        return o;
    }
}

function lookBackStringToJson(v) {
    const f = ((v[0] & 0x80000000) ? 2 : 0) + ((v[0] & 0x40000000) ? 1 : 0);
    const i = v[0] & 0x3fffffff;
    const s = typeof v[1] == "string" ? `'${v[1]}'` : v[1];
    return `lookbackstring(${f}, ${i}, ${s})`;
}
