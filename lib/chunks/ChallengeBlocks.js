import {GbxChunk} from "../chunk.js";
import {GbxObject, hex032} from "../gbxobject.js";

export class ChallengeBlock extends GbxObject {
    // index is only used to help user keep track in JSON
    constructor(version, index) {
        super(ChallengeBlock.template);
        this.version = version;
        this.index = index;
    }

    parseBinary(p) {
        super.parseBinary(p);
        this.copyTemplate();
        if (this.version) {
            this.addTemplateAndValue(p, "flags", "hex32");
        } else {
            this.addTemplateAndValue(p, "flags", "hex16");
        }
        if (this.flags == 0xffffffff || (!this.version && this.flags == 0xffff))
        {
            return;
        }
        if (this.flags & 0x8000) {
            this.addTemplateAndValue(p, "author", "lookbackstring");
            this.addTemplateAndValue(p, "skin", "noderef");
        }
        if (this.flags & 0x100000) {
            this.addTemplateAndValue(p, "blockParameters", "noderef");
        }
    }

    toJSON() {
        const o = super.toJSON();
        o.index = this.index;
        return o;
    }

    static template = [
        ["blockName", "lookbackstring"],
        ["rotation", "byte"],
        ["x", "byte"], ["y", "byte"], ["z", "byte"],
    ];
}

export class ChallengeBlocks extends GbxChunk {
    constructor(id, size) {
        super(ChallengeBlocks.template, "ChallengeBlocks", id, size);
        this.blocks = [];
    }

    parseBlock(p) {
        const block = new ChallengeBlock(this.version, this.blocks.length);
        block.parseBinary(p);
        this.blocks.push(block);
        return block;
    }

    doParseBinary(p) {
        GbxObject.prototype.parseBinary.call(this, p);
        this.copyTemplate();
        if (this.chunkID != 0x03043013) {
            this.addTemplateAndValue(p, "version", "uint32");
        }
        this.addTemplateAndValue(p, "numBlocks", "uint32");
        this.template.push(["blocks", "array"]);
        let nb = 0;
        while (nb < this.numBlocks) {
            const block = this.parseBlock(p);
            if (block.flags == 0xffffffff ||
                    (!this.version && block.flags == 0xffff))
            {
                continue;
            }
            ++nb;
        }
        // The docs say more blocks with flags 0xffffffff may follow after
        // numBlocks, but doesn't say how we're supposed to check for their
        // presence. If there are further blocks, the next field should be a
        // lookbackstring, if not it should be a chunkID.
        while (p.bytes.length - p.offset >= 12) {
            const o = p.offset;
            const w = p.uint32();
            if (w == 0xffffffff || w < 0x03000000) {
                // Looks like a lookbackstring, check what follows looks like
                // a block.
                p.offset = o;
                const s = p.lookbackstring();
                // Ignore 4 bytes rotation, x, y, z
                const rp = p.uint32();
                const flags = p.uint32();
                if (flags == 0xffffffff || (!this.version && flags == 0xffff)) {
                    // Yep, this really looks like a skippable block
                    p.offset = o;
                    this.parseBlock(p);
                } else {
                    console.warn(`ChallengeBlocks followed by something that ` +
                            `looks neither like a new chunk nor a trailing ` +
                            `block: { blockName: "${s}", rot/pos: ` +
                            `"${hex032(rp)}", flags: "${hex032(flags)}" }`);
                    p.offset = o;
                    break;
                }
            } else {
                p.offset = o;
                //console.log("No more trailing ffffffff blocks");
                break;
            }
        }
    }

    static template = [
        ["trackID", "meta"],
        ["trackName", "string"],
        ["decoration", "meta"],
        ["sizeX", "uint32"], ["sizeY", "uint32"], ["sizeZ", "uint32"],
        ["needUnlock", "bool"],
    ];
}
