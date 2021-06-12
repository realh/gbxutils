import {GbxChunk} from "../chunk.js";
import {GbxObject, hex032} from "../gbxobject.js";

export class ChallengeCheckpoint extends GbxObject {
    constructor() {
        super(ChallengeCheckpoint.template, "ChallengeCheckpoint");
    }

    // This is only documented as 3 ints, but coordinates is the most likely
    // purpose.
    static template = [
        ["x", "uint32"], ["y", "uint32"], ["z", "uint32"],
    ];
}

export class ChallengeCheckpoints extends GbxChunk {
    constructor(id, size) {
        super([], "ChallengeCheckpoints", id, size);
    }

    doParseBinary(p) {
        this.addTemplateAndValue(p, "numCheckpoints", "uint32");
        this.checkpoints = [];
        for (let i = 0; i < this.numCheckpoints; ++i) {
            const c = new ChallengeCheckpoint();
            c.parseBinary(p);
            this.checkpoints.push(c);
        }
        this.template.push(["checkpoints", "array", ChallengeCheckpoint,
                this.numCheckpoints]);
    }
}
