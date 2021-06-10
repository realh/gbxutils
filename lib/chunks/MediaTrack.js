import {GbxChunk} from "../chunk.js";

export class MediaTrack extends GbxChunk {
    constructor(id, size) {
        super([], "MediaTrack", id, size);
        this.tracks = [];
    }

    doParseBinary(p) {
        this.addTemplateAndValue(p, "trackName", "string");
        this.addTemplateAndValue(p, "ignored", "uint32");
        this.addTemplateAndValue(p, "numTracks", "uint32");
        this.template.push(["tracks", "array", "noderef"]);
        for (let i = 0; i < this.numTracks; ++i) {
            this.tracks.push(p.noderef());
        }
        this.addTemplateAndValue(p, "unknown", "uint32");
    }
}
