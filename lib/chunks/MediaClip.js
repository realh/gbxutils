import {GbxChunk} from "../chunk.js";

export class MediaClip extends GbxChunk {
    constructor(id, size) {
        super([], "MediaClip", id, size);
        this.tracks = [];
    }

    doParseBinary(p) {
        const cid = this.chunkID & 0xff;
        this.addTemplateAndValue(p, "a", "uint32");
        if (cid == 0x0d) {
            this.addTemplateAndValue(p, "version", "uint32");
        }
        this.addTemplateAndValue(p, "numTracks", "uint32");
        this.template.push(["tracks", "array", "noderef"]);
        for (let i = 0; i < this.numTracks; ++i) {
            this.tracks.push(p.noderef());
        }
        this.addTemplateAndValue(p, "clipName", "string");
        if (cid == 2) {
            this.addTemplateAndValue(p, "b", "uint32");
        } else if (cid == 0x0d) {
            this.addTemplateAndValue(p, "stopWhenLeave", "bool");
            this.addTemplateAndValue(p, "bool", "bool");
            this.addTemplateAndValue(p, "stopWhenRespawn", "bool");
            this.addTemplateAndValue(p, "text", "string");
            this.addTemplateAndValue(p, "f", "float");
            this.addTemplateAndValue(p, "localPlayerClipEntIndex", "uint32");
        }
    }
}
