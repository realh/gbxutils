import {GbxChunk} from "../chunk.js";
import {GbxObject} from "../gbxobject.js";

export class ArchiveGmCam extends GbxChunk {
    constructor(id, size) {
        super([], "ArchiveGmCam", id, size);
    }

    doParseBinary(p) {
        this.addTemplateAndValue(p, "archiveGmCamVal", "bool");
        if (this.archiveGmCamVal) {
            this.addTemplateAndValue(p, "b", "byte");
            this.addTemplateAndValue(p, "gmMat3", "mat3x3");
            this.addTemplateAndValue(p, "vec", "vec3");
            this.addTemplateAndValue(p, "f1", "float");
            this.addTemplateAndValue(p, "f2", "float");
            this.addTemplateAndValue(p, "f3", "float");
        }
        if (this.chunkID == 0x03043028) {
            this.addTemplateAndValue(p, "comments", "string");
        }
    }
}
