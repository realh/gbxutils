import {GbxObject, bytesToHex} from "./gbxobject.js";
import {GbxChunk, ChunkSize} from "./chunk.js";

const SKIP = 0x534B4950;

export class GbxNode extends GbxObject {
    constructor() {
        super(GbxNode.template);
        this.chunks = [];
    }

    toBin(b) {
        b.data(this.data);
    }

    parseBinary(p) {
        this.chunks = [];
        while (true)
        {
            const chunkID = p.uint32();
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
            const chunk = GbxChunk.make(p, chunkID, chunkSize);
            chunk.skip = skip;
            this.chunks.push(chunk);
        }
    }

    static template = [["chunks", "Array"]];
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
        this.index = index;
        this.nodeList = nodeList;
    }

    // At this point the index will already have been read and passed to the
    // constructor
    parseBinary(p) {
        if (this.index < 0) { return; }
        let nodeDetails = this.nodeList.get(this.index);
        if (nodeDetails) {
            nodeDetails.refs.push(this);
        } else {
            const classID = p.uint32();
            const node = new GbxNode();
            node.parseBinary(p);
            nodeDetails = { classID, node, refs: [this], saved: false };
            this.nodeList.set(this.index, nodeDetails);
        }
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
}
