import {GbxObject} from "./gbxobject.js";

export class GbxBody extends GbxObject {
    constructor() {
        super(GbxBody.template);
    }

    toJSON() {
        return { data: "[...]", size: this.data.length };
    }

    static template = [["data", "data"]];
}

export class GbxCompressedBody extends GbxObject {
    constructor() {
        super(GbxCompressedBody.template);
    }

    toJSON() {
        return { compressedData: "[...]", size: this.compressedData.length };
    }

    static template = [["compressedData", "data"]];
}
