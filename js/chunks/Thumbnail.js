import {GbxChunk} from "../core/chunk.js";
import {GbxObject} from "../core/gbxobject.js";

export class Thumbnail extends GbxChunk {
    constructor(id, size) {
        super(Thumbnail.template, "Thumbnail", id, size);
    }

    doParseBinary(p) {
        GbxObject.prototype.parseBinary.call(this, p);
        this.copyTemplate();
        if (this.version >= 1) {
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
