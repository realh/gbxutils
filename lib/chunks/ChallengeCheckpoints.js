import {GbxChunk} from "../chunk.js";
import {GbxObject, hex032} from "../gbxobject.js";

export class ChallengeCheckpoint extends GbxObject {
    constructor() {
        super(ChallengeCheckpoint.template, "ChallengeCheckpoint");
    }

    // This is only documented as 3 ints, but map coordinates appears to be a
    // correct assumption
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

    // To ensure consistency when removing duplicate checkpoints this first
    // tests whether there is more than one checkpoint at the given coords. If
    // there is more than one it removes the second one it found; if there is
    // only one, that one is removed.
    removeCheckpointAt(x, y, z) {
        let match = -1;
        for (let i = 0; i < this.checkpoints.length; ++i) {
            const cp = this.checkpoints[i];
            if (cp.x == x && cp.y == y && cp.z == z) {
                if (match != -1) {
                    this.checkpoints.splice(i, 1);
                    return;
                } else {
                    match = i;
                }
            }
        }
        if (match != -1) {
            this.checkpoints.splice(match, 1);
            --this.numCheckpoints;
            this.sizeChangeIsHarmless = true;
            this.addArrayTemplate("checkpoints", -1);
        } else {
            console.warn(`No checkpoint at (${x}, ${y}, ${z})`);
        }
    }

    addCheckpointAt(x, y, z) {
        const cp = new ChallengeCheckpoint();
        cp.x = x;
        cp.y = y;
        cp.z = z;
        this.checkpoints.push(cp);
        ++this.numCheckpoints;
        this.sizeChangeIsHarmless = true;
        this.addArrayTemplate("checkpoints", 1);
    }
}
