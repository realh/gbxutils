import {GbxBytesParser} from "./parser.js";
import {GbxObject} from "./gbxobject.js";

function addSubFolders(o, p) {
    if (o.numSubFolders > 0) {
        o.folders = [];
        for (let n = 0; n < o.numSubFolders; ++n) {
            o.folders.push(new SubFolder(p));
        }
    }
}

export class SubFolder extends GbxObject {
    constructor(p) {
        super(SubFolder.template);
    }

    parseBinary(p) {
        this.name = p.string();
        this.numSubFolders = p.uint32();
        this.addSubFolders(p, this.numSubFolders);
        return this;
    }

    addSubFolders(p) {
        if (this.numSubFolders > 0) {
            this.template = SubFolder.template0.concat(
                    ["folders", "array", SubFolder, this.numSubFolders]);
        }
        addSubFolders(this, p);
    }

    static template = [["name", "string"], ["numSubFolders", "uint32"]];
}

export class GbxReferenceTable extends GbxObject {
    constructor() {
        super(GbxReferenceTable.template);
    }

    parseBinary(p) {
        super.parseBinary(p);
        if (this.numExternalNodes > 0) {
            this.copyTemplate();
            this.addTemplateAndValue(p, "ancestorLevel", "uint32");
            this.addTemplateAndValue(p, "numSubFolders", "uint32");
            console.log(`${this.numExternalNodes} external nodes, ` +
                    `${this.numSubFolders} folders`);
            if (this.numSubFolders > 0) {
                this.template.push(["folders", "array", SubFolder,
                    this.numSubFolders]);
            }
            addSubFolders(this, p);
        }
        return this;
    }

    static template = [["numExternalNodes", "uint32"]];
}
