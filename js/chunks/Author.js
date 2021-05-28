import {GbxChunk} from "../core/chunk.js";
import {GbxObject} from "../core/gbxobject.js";

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
