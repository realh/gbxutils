import {GbxChunk} from "../chunk.js";
import {GbxObject} from "../gbxobject.js";

export class Author extends GbxChunk {
    constructor(id, size) {
        super(Author.template, "Author", id, size);
    }

    static template = [
        ["version", "uint32"],
        ["authorVersion", "uint32"],
        ["authorLogin", "string"],
        ["authorNick", "string"],
        ["authorZone", "string"],
        ["authorExtraInfo", "string"],
    ];
}
