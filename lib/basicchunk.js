import {GbxChunk} from "./chunk.js";
import {GbxObject} from "./gbxobject.js";

// Dynamically makes a subclass of GbxChunk which either has a fixed template
// or a custom parser. name is used as the constructor name so should begin
// with a capital. Also registers the class in GbxChunk.registry.
export function makeChunkSubclass(name, id, template, parser) {
    // Assigning a class/constructor to an object key names it after the key
    let o = {};
    o[name] = class extends GbxChunk {
        constructor() {
            super(template, name, id);
        }
    }
    if (parser) {
        o[name].prototype.parseBinary = parser;
    /*
    } else {
        o[name].prototype.parseBinary = GbxObject.prototype.parseBinary;
    */
    }
    GbxChunk.registry.set(id, o[name]);
    return o[name];
}

makeChunkSubclass("Meta", 0x0304300D, [["meta", "meta"]]);
makeChunkSubclass("Challenge11", 0x03043011, [
        ["collectorList", "noderef"],
        ["challengeParameters", "noderef"],
        ["kind", "uint32"]
]);
makeChunkSubclass("Challenge21", 0x03043021, [
        ["clipIntro", "noderef"],
        ["clipGroupInGame", "noderef"],
        ["clipGroupEndRace", "noderef"]
]);
makeChunkSubclass("Challenge22", 0x03043022, [
        ["uint32", "uint32"]
]);
makeChunkSubclass("Challenge24", 0x03043024, [
        ["customMusicPackDesc", "fileref"]
]);
makeChunkSubclass("Challenge25", 0x03043025, [
        ["mapCoordOrigin", "vec2"],
        ["mapCoordTarget", "vec2"]
]);
makeChunkSubclass("Challenge26", 0x03043026, [
        ["clipGlobal", "noderef"]
]);
makeChunkSubclass("Challenge2A", 0x0304302a, [
        ["bool", "bool"]
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
makeChunkSubclass("ChallengeParameters06", 0x0305b006, [], function(p)
{
    this.copyTemplate();
    this.addTemplateAndValue(p, "numItems", "uint32");
    this.addTemplateAndValue(p, "items", "array", this.numItems, "uint32");
});
makeChunkSubclass("ChallengeParameters08", 0x0305b008, [
        ["timeLimit", "uint32"],
        ["authorScore", "uint32"]
]);
makeChunkSubclass("ChallengeParameters0A", 0x0305b00a, [
        ["zero", "uint32"],
        ["bronzeTime", "uint32"],
        ["silverTime", "uint32"],
        ["goldTime", "uint32"],
        ["authorTime", "uint32"],
        ["timeLimit", "uint32"],
        ["authorScore", "uint32"]
]);
makeChunkSubclass("ChallengeParameters0D", 0x0305b00d, [["neg1", "uint32"]]);
makeChunkSubclass("ChallengeParameters0E", 0x0305b00e, [
        ["a", "uint32"],
        ["b", "float"],
        ["c", "uint32"]
]);

makeChunkSubclass("BlockSkin00", 0x03059000, [
        ["text", "string"],
        ["ignored", "string"]
]);
makeChunkSubclass("BlockSkin01", 0x03059001, [
        ["text", "string"],
        ["packDesc", "fileref"]
]);
makeChunkSubclass("BlockSkin02", 0x03059002, [
        ["text", "string"],
        ["packDesc", "fileref"],
        ["parentPackDesc", "fileref"]
]);
makeChunkSubclass("BlockSkin03", 0x03059003, [
        ["version", "uint32"],
        ["secondaryPackDesc", "string"]
]);

makeChunkSubclass("MediaClip04", 0x03079004, [["ignored", "uint32"]]);
makeChunkSubclass("MediaClip04", 0x03079007,
        [["localPlayerClipEntIndex", "uint32"]]);
makeChunkSubclass("MediaClip04", 0x0307900a,
        [["stopWhenLeave", "bool"]]);
