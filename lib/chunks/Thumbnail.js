import {GbxChunk} from "../chunk.js";
import {GbxObject} from "../gbxobject.js";

export class Thumbnail extends GbxChunk {
    constructor(id, size) {
        super(Thumbnail.template, "Thumbnail", id, size);
    }

    doParseBinary(p) {
        GbxObject.prototype.parseBinary.call(this, p);
        if (this.version >= 1) {
            this.copyTemplate();
            this.addTemplateAndValue(p, "thumbSize", "uint32");
            p.skip("<Thumbnail.jpg>".length);
            this.addTemplateAndValue(p, "thumb", "data", this.thumbSize);
            p.skip("</Thumbnail.jpg>".length);
            p.skip("<Comments>".length);
            this.addTemplateAndValue(p, "comments", "string");
            p.skip("</Comments>".length);
        }
    }

    toJSON() {
        let o = super.toJSON();
        o.thumb = "[...]";
        return o;
    }

    toBin(b) {
        b.uint32(this.version);
        if (this.version >= 1) {
            b.uint32(this.thumbSize);
            let s = "<Thumbnail.jpg>";
            b.string(s, s.length);
            b.data(this.thumb);
            s = "</Thumbnail.jpg>";
            b.string(s, s.length);
            s = "<Comments>";
            b.string(s, s.length);
            b.string(this.comments);
            s = "</Comments>";
            b.string(s, s.length);
        }
    }

    static template = [["version", "uint32"]];
}

/*
uint32 version
if version != 0:
    uint32 thumbSize
    "<Thumbnail.jpg>"
    byte thumb[thumbSize]
    "</Thumbnail.jpg>"
    "<Comments>"
    string comments
    "</Comments>"
*/
