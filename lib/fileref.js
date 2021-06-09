import {GbxObject, bytesToHex} from "./gbxobject.js";

export class FileRef extends GbxObject {
    constructor() {
        super([]);
    }

    // At this point the index will already have been read and passed to the
    // constructor
    parseBinary(p) {
        this.copyTemplate();
        this.addTemplateAndValue(p, "version", "byte");
        if (this.version >= 3) {
            this.addTemplateAndValue(p, "checksum", "array", 32, "byte");
        }
        this.addTemplateAndValue(p, "filePath", "string");
        if (this.filePath.length > 0 && this.version >= 1) {
            this.addTemplateAndValue(p, "locatorUrl", "string");
        }
        return this;
    }

    toJSON() {
        const o = super.toJSON();
        if (this.version >= 3) {
            o.checksum = bytesToHex(this.checksum, '');
        }
        return o;
    }
}
