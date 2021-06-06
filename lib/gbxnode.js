import {GbxObject, bytesToHex} from "./gbxobject.js";
import {GbxChunk, ChunkSize} from "./chunk.js";

const SKIP = 0x534B4950;

export class GbxNode extends GbxObject {
    constructor() {
        super(GbxNode.template);
        this.chunks = [];
    }

    toBin(b) {
        b.data(this.data);
    }

    parseBinary(p) {
        this.chunks = [];
        while (true)
        {
            const chunkID = p.uint32();
            if (chunkID == 0xFACADE01) // no more chunks
            {
                return;
            }
            // The example in the wikis looks up some flags based on chunkID,
            // but it's a black box function, so I'll have to just ignore them
            // and wing it and hope that the skip field is always SKIP for
            // chunks that are supposed to have a skippable field.
            let skip = p.uint32();
            let chunkSize = undefined;
            if (skip == SKIP) {
                chunkSize = new ChunkSize(p.uint32());
            } else {
                skip = undefined;
                p.offset -= 4;
            }
            const chunk = GbxChunk.make(p, chunkID, chunkSize);
            chunk.skip = skip;
            this.chunks.push(chunk);
        }
    }

    static template = [["chunks", "Array"]];
}

