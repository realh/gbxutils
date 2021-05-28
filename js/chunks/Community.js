import {GbxChunk} from "../core/chunk.js";
import {GbxObject} from "../core/gbxobject.js";

export class Community extends GbxChunk {
    constructor(id, size) {
        super(Community.template, "Community", id, size);
    }

    static template = [["xml", "string"]];
}
