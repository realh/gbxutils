import {GbxBytesParser} from "./parser.js";

function addSubFolders(o, p) {
    if (o.numSubFolders > 0) {
        o.folders = [];
        for (let n = 0; n < o.numSubFolders; ++n) {
            o.folders.push(new SubFolder(p));
        }
    }
}

export class SubFolder {
    constructor(p) {
        this.name = p.string();
        this.numSubFolders = p.uint32();
        addSubFolders(this, p, this.numSubFolders);
    }

    toJSON() {
        let o = {
            name: this.name,
            numSubFolders: this.numSubFolders
        }
        if (this.numSubFolders > 0) {
            o.folders = this.folders;
        }
        return o;
    }
}

export class GbxReferenceTable {
    constructor(inp) {
        if (inp instanceof GbxBytesParser) {
            this.constructFromParser(inp);
        /*
        } else if (typeof inp == "string") {
            this.data = JSON.parse(inp);
        */
        } else {
            Object.assign(this, inp);
        }
    }

    constructFromParser(p) {
        this.numExternalNodes = p.uint32();
        if (this.numExternalNodes > 0) {
            this.ancestorLevel = p.uint32();
            this.numSubFolders = p.uint32();
            addSubFolders(this, p);
        }
    }

    toJSON() {
        let jsonable = {
            numExternalNodes: this.numExternalNodes
        }
        if (this.numExternalNodes > 0) {
            jsonable.ancestorLevel = this.ancestorLevel;
            jsonable.numSubFolders = this.numSubFolders;
            if (this.numSubFolders > 0) {
                jsonable.folders = this.folders;
            }
        }
        return jsonable;
    }
}
