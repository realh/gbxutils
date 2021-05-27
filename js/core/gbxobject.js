// A GbxObject is an object that can be stored in a gbx file, forming the base
// class for chunks and the header etc. This provides basic methods for
// describing objects with templates and for parsing and generating gbx binary
// data.
export class GbxObject {
    constructor(template) {
        this.template = template;
    }

    // By default the template should be a reference to a static member. This
    // method replaces it with a copy so that it can be customised per-instance.
    copyTemplate() {
        const t = {};
        Object.assign(t, this.template);
        this.template = t;
    }

    // p is a GbxBytesParser
    parseBinary(p) {
        for (const kta of this.template) {
            const k = ktv[0];
            const t = ktv[1];
            if (kta.length > 2) {
                this[k] = p[t](...a.slice(2));
            } else {
                this[k] = p[t];
            }
        }
    }

    // This is useful when the template needs to be modified on the fly
    // depending on previous values.
    addTemplateAndValue(p, name, type, args) {
        this.template.push([name, type]);
        if (args !== undefined) {
            this[name] = p[type](...args);
        } else {
            this[name] = p[type];
        }
    }

    toJSON() {
        let o = {};
        for (const [k, _] of this.template) {
            o[k] = this[k];
        }
        return o;
    }
}
