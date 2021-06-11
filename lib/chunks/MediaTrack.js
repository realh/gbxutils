import {GbxChunk} from "../chunk.js";
import {makeChunkSubclass} from "../basicchunk.js";

export class MediaTrack01 extends GbxChunk {
    constructor(id, size) {
        super([], "MediaTrack01", id, size);
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


export var MediaTrack04 = makeChunkSubclass("MediaTrack04", 0x03078004,
        [["keepPlaying", "bool"], ["ignored", "bool"]]);
