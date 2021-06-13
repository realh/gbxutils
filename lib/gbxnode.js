import {GbxObject, bytesToHex, hex032} from "./gbxobject.js";
import {GbxChunk, ChunkSize} from "./chunk.js";
import {Serializer} from "./serializer.js";

const SKIP = 0x534B4950;

export class GbxNode extends GbxObject {
    constructor() {
        super(GbxNode.template);
        this.chunks = [];
    }

    parseBinary(p) {
        this.chunks = [];
        while (true)
        {
            const rem = p.bytes.length - p.offset;
            if (rem == 0) {
                console.log("End of input");
                return;
            } else if (rem < 4) {
                throw Error(`${rem} odd bytes at end of file`);
            }
            let chunkID = p.uint32();
            if (typeof chunkID != "number" || (!chunkID && chunkID != 0) ||
                    `${chunkID}` == "NaN")
            {
                console.log(`There were ${rem} bytes left`);
                console.log(`offset ${p.offset}`);
                throw Error(`chunkID ${chunkID} is not valid`);
            }
            if (chunkID == 0xFACADE01) // no more chunks
            {
                return;
            }
            // The example in the wikis looks up some flags based on chunkID,
            // but it's a black box function, so I'll have to just ignore them
            // and wing it and hope that the skip field is always SKIP for
            // chunks that are supposed to have a skippable field.
            let skip = p.uint32();
            let chunkSize = undefined;
            if (skip == SKIP) {
                chunkSize = new ChunkSize(p.uint32());
            } else {
                skip = undefined;
                p.offset -= 4;
            }
            try {
                /*
                if (!(chunkID & 0xfff) && !GbxChunk.registry.get(chunkID) &&
                        !skip)
                {
                    const classID = chunkID;
                    chunkID = p.uint32();
                    if (GbxChunk.registry.get(chunkID)) {
                        console.log(`GbxNode.parseBinary: seem to have ` +
                                `classID ${hex032(classID)} followed by ` +
                                `chunkID ${hex032(chunkID)}`);
                    } else {
                        p.offset -= 4;
                    }
                }
                */
                const chunk = GbxChunk.make(chunkID, chunkSize);
                chunk.skip = skip;
                this.chunks.push(chunk);
                chunk.parseBinary(p);
            } catch (err) {
                console.error(err);
                let rem = p.bytes.length - p.offset;
                /*
                console.log(`${rem} bytes remaining:\n` +
                        bytesToHex(p.bytes.slice(p.offset,
                                p.offset + Math.min(rem, 256))));
                */
                throw Error(`Failed to load chunk at node index ` +
                        `${this.chunks.length}`);

            }
        }
        this.copyTemplate();
        this.template[0].push(this.chunks.length);
    }

    toBin(b) {
        for (const c of this.chunks) {
            b.uint32(c.chunkID);
            if (c.skip == SKIP) {
                const b2 = new Serializer();
                c.toBin(b2);
                b.uint32(SKIP);
                let sz = b2.bytes.length;
                if (!c.sizeChangeIsHarmless && c.chunkSize.size() != sz) {
                    console.warn(`Expected node chunk ${hex032(c.chunkID)} ` +
                            `to be ${c.chunkSize.size()} bytes, ` +
                            `got ${sz}`);
                }
                if (c.chunkSize && c.chunkSize.heavy()) {
                    sz = sz | 0x80000000;
                }
                b.uint32(sz);
                b.data(b2.bytes);
            } else {
                c.toBin(b);
            }
        }
        b.uint32(0xFACADE01);
    }


    static template = [["chunks", "array", GbxChunk]];
}

GbxChunk.registry.set(0x03043011, GbxNode);

// NodeRef holds a reference to a NodeList and an index of the NodeDetails
// within that list. Each value in the NodeList is an object, which in
// typescript would be defined as:
// interface NodeDetails {
//     classID: uint32
//     node: GbxNode
//     refs: NodeRef[]
//     saved: boolean   // Whether an instance has been written to the current 
//                      // output file yet
// }
// NodeList is actually a Map because it may be a sparse array.
export class NodeRef extends GbxObject {
    constructor(index, nodeList) {
        super([]);
        this.index = index == 0xffffffff ? -1 : index;
        this.nodeList = nodeList;
    }

    // At this point the index will already have been read and passed to the
    // constructor
    parseBinary(p) {
        if (this.index < 0) { return this; }
        let nodeDetails = this.nodeList.get(this.index);
        if (nodeDetails) {
            nodeDetails.refs.push(this);
        } else {
            const classID = p.uint32();
            const node = new GbxNode();
            nodeDetails = { classID, node, refs: [this], saved: false };
            this.nodeList.set(this.index, nodeDetails);
            try {
                node.parseBinary(p);
            } catch (err) {
                console.error(err);
                throw Error(`Unable to parse noderef body for index ` +
                        `${this.index} and classID ${hex032(classID)}`);
            }
        }
        return this;
    }

    toBin(b) {
        let index = this.index;
        let nodeDetails;
        if (index >= 0) {
            nodeDetails = this.nodeList.get(index);
            if (!nodeDetails) {
                console.warn(
                        `noderef index ${this.index} not found in nodeList`);
                index = -1;
            }
        }
        b.uint32(index);
        if (nodeDetails && !nodeDetails.saved) {
            b.uint32(nodeDetails.classID);
            nodeDetails.node.toBin(b);
            nodeDetails.saved = true;
        }
    }

    toJSON() {
        let o = { nodeRefIndex: this.index };
        let nodeDetails = this.index >= 0 ?
            this.nodeList.get(this.index) : null;
        if (nodeDetails && !nodeDetails.saved) {
            Object.assign(o, nodeDetails);
            delete o.saved;
            nodeDetails.saved = true;
        }
        return o;
    }
}
