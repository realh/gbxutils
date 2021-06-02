import {GbxChunk} from "../chunk.js";
import {GbxObject} from "../gbxobject.js";

export class Community extends GbxChunk {
    constructor(id, size) {
        super(Community.template, "Community", id, size);
        this.sizeChangeIsHarmless = true;
    }

    static template = [["xml", "xml"]];
}
