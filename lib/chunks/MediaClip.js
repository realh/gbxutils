import {GbxChunk} from "../chunk.js";
import {GbxObject} from "../gbxobject.js";

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
        this.template.push(["tracks", "array", this.numTracks, "noderef"]);
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

class MediaGroupClip extends GbxObject {
    constructor() {
        super(ClipKey.template, "MediaGroupClip");
    }

    parseBinary(p) {
        this.copyTemplate();
        super.parseBinary(p);
        this.triggers = [];
        for (let i = 0; i < this.numTriggers; ++i) {
            this.triggers.push(p.vec3());
        }
        this.template.push(["triggers", "array", this.numTriggers, "vec3"]);
    }

    static template = [["referenceFramePosition", "vec3"],
        ["referenceFrameRotation", "uint32"], ["triggerCondition", "uint32"],
        ["triggerArgument", "float"], ["numTriggers", "uint32"]];
}

export class MediaClipGroup extends GbxChunk {
    constructor(id, size) {
        super([], "MediaClipGroup", id, size);
    }

    doParseBinary(p) {
        this.addTemplateAndValue(p, "ignored", "uint32");
        this.addTemplateAndValue(p, "numClipNodes", "uint32");
        this.clipNodes = [];
        for (let i = 0; i < this.numClipNodes; ++i) {
            this.clipNodes.push(p.noderef());
        }
        this.template.push(["clipNodes", "array",
                this.numClipNodes, "noderef"]);
        this.addTemplateAndValue(p, "numClip", "uint32");
        this.clips = [];
        for (let i = 0; i < this.numClips; ++i) {
            const c = new MediaClipGroup();
            c.parseBinary(p);
            this.clips.push(c);
        }
        this.template.push(["clips", "array", this.numClips, MediaGroupClip]);
    }
}
