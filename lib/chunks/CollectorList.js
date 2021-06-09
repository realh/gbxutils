import {GbxChunk} from "../chunk.js";
import {GbxObject} from "../gbxobject.js";

export class CollectorList extends GbxChunk {
    constructor(id, size) {
        super([], "CollectorList", 0x0301b000);
        this.archiveCount = 0;
        this.archive = [];
    }

    parseBinary(p) {
        this.archiveCount = p.uint32();
        for (let i = 0; i < this.archiveCount; ++i) {
            const meta = p.meta();
            const numPieces = p.uint32();
            this.archive.push({meta, numPieces});
        }
    }

    toBin(b) {
        let archiveCount = this.archiveCount;
        if (this.archive.length != archiveCount) {
            console.warn(`CollectorList should contain ${archiveCount} ` +
                    `items, but actually contains ${this.archive.length}`);
            archiveCount = this.archive.length;
        }
        b.uint32(archiveCount);
        for (const a of this.archive) {
            b.meta(a.meta);
            b.uint32(a.numPieces);
        }
    }

    toJSON() {
        return {
            chunkID: 0x0301b000,
            chunkName: "CollectorList",
            archiveCount: this.archiveCount,
            archive: this.archive
        }
    }
}
