import {GbxChunk} from "../core/chunk.js";
import {GbxObject} from "../core/gbxobject.js";

export class Version extends GbxChunk {
    constructor(id, size) {
        super(Version.template, "Version", id, size);
    }

    static template = [["version", "uint32"]];
}
