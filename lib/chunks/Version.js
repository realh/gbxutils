import {GbxChunk} from "../chunk.js";
import {GbxObject} from "../gbxobject.js";

export class Version extends GbxChunk {
    constructor(id, size) {
        super(Version.template, "Version", id, size);
    }

    static template = [["version", "uint32"]];
}
