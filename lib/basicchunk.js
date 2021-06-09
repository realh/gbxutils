import {GbxChunk} from "./chunk.js";
import {GbxObject} from "./gbxobject.js";

// Dynamically makes a subclass of GbxChunk which either has a fixed template
// or a custom parser. name is used as the constructor name so should begin
// with a capital. Also registers the class in GbxChunk.registry.
export function makeChunkSubclass(name, id, template, parser) {
    const ctor = function() {
        GbxChunk.call(this, template, name, id);
    }
    ctor.name = name;
    const proto = Object.create(GbxChunk.prototype);
    proto.constructor = ctor;
    ctor.prototype = proto;
    if (parser) {
        proto.parseBinary = parser;
    } else {
        proto.parseBinary = GbxObject.prototype.parseBinary;
    }
    GbxChunk.registry.set(id, ctor);
    return ctor;
}

makeChunkSubclass("Meta", 0x0304300D, [["meta", "meta"]]);
makeChunkSubclass("03043011", 0x03043011, [
        ["collectorList", "noderef"],
        ["challengeParameters", "noderef"],
        ["kind", "uint32"]
]);
makeChunkSubclass("ChallengeParameters00", 0x0305b000, [
        ["a", "uint32"],
        ["b", "uint32"],
        ["c", "uint32"],
        ["d", "uint32"],
        ["e", "uint32"],
        ["f", "uint32"],
        ["g", "uint32"],
        ["h", "uint32"]
]);
makeChunkSubclass("ChallengeParameters01", 0x0305b001, [
        ["tip1", "string"],
        ["tip2", "string"],
        ["tip3", "string"],
        ["tip4", "string"]
]);
makeChunkSubclass("ChallengeParameters02", 0x0305b002, [
        ["a", "uint32"],
        ["b", "uint32"],
        ["c", "uint32"],
        ["d", "float"],
        ["e", "float"],
        ["f", "float"],
        ["g", "uint32"],
        ["h", "uint32"],
        ["i", "uint32"],
        ["j", "uint32"],
        ["k", "uint32"],
        ["l", "uint32"],
        ["m", "uint32"],
        ["n", "uint32"],
        ["o", "uint32"],
        ["p", "uint32"]
]);
makeChunkSubclass("ChallengeParameters03", 0x0305b003, [
        ["a", "uint32"],
        ["b", "float"],
        ["c", "uint32"],
        ["d", "uint32"],
        ["e", "uint32"],
        ["f", "uint32"]
]);
makeChunkSubclass("ChallengeParametersTimes", 0x0305b004, [
        ["bronzeTime", "uint32"],
        ["silverTime", "uint32"],
        ["goldTime", "uint32"],
        ["authorTime", "uint32"],
        ["ignored", "uint32"]
]);
makeChunkSubclass("ChallengeParameters05", 0x0305b005, [
        ["a", "uint32"],
        ["b", "float"],
        ["c", "uint32"]
]);