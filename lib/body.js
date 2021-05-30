import {GbxObject} from "./gbxobject.js";
import {Serializer} from "./serializer.js";

export class GbxRawBody extends GbxObject {
    constructor() {
        super(GbxBody.template);
    }

    toJSON() {
        return { data: "[...]", size: this.data.length };
    }

    toBin(b) {
        b.data(this.data);
    }

    compress() {
        return this.data;
    }

    static template = [["data", "data"]];
}

export class GbxBody extends GbxObject {
    constructor() {
        super(GbxBody.template);
    }

    toJSON() {
        return { data: "[...]", size: this.data.length };
    }

    toBin(b) {
        b.data(this.data);
    }

    compress() {
        const b = new Serializer();
        this.toBin(b);
        return b.data;
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

    compress() {
        return this.compressedData;
    }

    static template = [["compressedData", "data"]];
}
