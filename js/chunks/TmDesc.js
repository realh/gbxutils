import {GbxChunk} from "../core/chunk.js";
import {GbxObject} from "../core/gbxobject.js";

export class TMDesc extends GbxChunk {
    constructor(id, size) {
        super(TMDesc.template, "TMDesc", id, size);
    }

    doParseBinary(p) {
        GbxObject.prototype.parseBinary.call(this, p);
        this.copyTemplate();
        if (this.version < 3) {
            this.addTemplateAndValue(p, "meta", "meta");
            this.addTemplateAndValue(p, "trackName", "string");
        }
        this.addTemplateAndValue(p, "bool1", "bool");
        if (this.version >= 1) {
            this.addTemplateAndValue(p, "bronzeTime", "uint32");
            this.addTemplateAndValue(p, "silverTime", "uint32");
            this.addTemplateAndValue(p, "goldTime", "uint32");
            this.addTemplateAndValue(p, "authorTime", "uint32");
        }
        if (this.version == 2) {
            this.addTemplateAndValue(p, "v2byte", "byte");
        }
        if (this.version >= 4) {
            this.addTemplateAndValue(p, "cost", "uint32");
        }
        if (this.version >= 5) {
            this.addTemplateAndValue(p, "multilap", "bool");
        }
        if (this.version == 6) {
            this.addTemplateAndValue(p, "v6bool", "bool");
        }
        if (this.version >= 7) {
            this.addTemplateAndValue(p, "trackType", "uint32");
        }
        if (this.version >= 9) {
            this.addTemplateAndValue(p, "v9int", "uint32");
        }
        if (this.version >= 10) {
            this.addTemplateAndValue(p, "authorScore", "uint32");
        }
        if (this.version >= 11) {
            this.addTemplateAndValue(p, "editorMode", "uint32");
        }
        if (this.version >= 12) {
            this.addTemplateAndValue(p, "v12bool", "bool");
        }
        if (this.version >= 13) {
            this.addTemplateAndValue(p, "nbCheckpoints", "uint32");
            this.addTemplateAndValue(p, "nbLaps", "uint32");
        }
    }

    static template = [["version", "byte"]];
}
