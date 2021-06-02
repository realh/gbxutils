import {GbxChunk} from "../chunk.js";
import {GbxObject} from "../gbxobject.js";

export class Common extends GbxChunk {
    constructor(id, size) {
        super(Common.template, "Common", id, size);
    }

    doParseBinary(p) {
        let o0;
        if (this.name == "Common") {
            console.log("Reading Common");
            o0 = p.offset;
        }
        GbxObject.prototype.parseBinary.call(this, p);
        this.copyTemplate();
        if (this.version >= 1) {
            this.addTemplateAndValue(p, "locked", "bool");
            this.addTemplateAndValue(p, "password", "string");
        }
        if (this.version >= 2) {
            this.addTemplateAndValue(p, "decoration", "meta");
        }
        if (this.version >= 3) {
            this.addTemplateAndValue(p, "mapOrigin", "vec2D");
        }
        if (this.version >= 4) {
            this.addTemplateAndValue(p, "mapTarget", "vec2D");
        }
        if (this.version >= 5) {
            this.addTemplateAndValue(p, "uint128", "uint128");
        }
        if (this.version >= 6) {
            this.addTemplateAndValue(p, "mapType", "string");
            this.addTemplateAndValue(p, "mapStyle", "string");
            if (this.version <= 8) {
                this.addTemplateAndValue(p, "bool", "bool");
            }
        }
        if (this.version >= 8) {
            this.addTemplateAndValue(p, "lightmapCacheUID", "uint64");
        }
        if (this.version >= 9) {
            this.addTemplateAndValue(p, "lightmapVersion", "byte");
        }
        if (this.version >= 11) {
            this.addTemplateAndValue(p, "titleUID", "lookbackstring");
        }
        if (this.name == "Common") {
            console.log(`Completed Common read of ${p.offset - o0} bytes`);
        }
    }

    static template = [
        ["version", "byte"], ["meta", "meta"], ["trackName", "string"],
        ["kind", "byte"]
    ];
}
