const {Hex, GbxBytesParser} = imports.core.parser;

var GbxChunk = (function() {

class GbxChunk {
    constructor(inp, id, size) {
        if (inp instanceof GbxBytesParser) {
            this.constructFromParser(inp, id, size);
        } else {
            Object.assign(this, inp);
        }
    }

    constructFromParser(p, id, size) {
        this.chunkID = id;
        this.chunkSize = size;
        this.data = p.data(size);
    }

    toJSON() {
        const d = this.data;
        let data = [];
        let n = 0;
        for (n = 0; n < 8 && n + 4 <= this.chunkSize; n += 4) {
            // | and << make the result signed int32 :-(
            data.push(d[n] + (d[n + 1] * 0x100) +
                (d[n + 2] * 0x10000) + (d[n + 3] << 0x1000000));
        }
        if (this.chunkSize - n == 2 || this.chunkSize - n == 1) {
            data.push(d[n] + (d[n + 1] * 0x100));
            n += 2;
        }
        if (this.chunkSize - n == 1) {
            data.push(d[n]);
            ++n;
        }
        data = data.map(v => new Hex(v));
        if (n < this.chunkSize) {
            data.push("...");
        }
        return {
            chunkID: this.chunkID,
            chunkSize: this.chunkSize,
            data
        }
    }

    static make(inp, id, size) {
        return new GbxChunk(inp, id, size);
    }
}

return GbxChunk;

})();
