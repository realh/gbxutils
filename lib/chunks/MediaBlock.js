import {GbxChunk} from "../chunk.js";
import {GbxObject} from "../gbxobject.js";
import {makeGbxSubclass} from "../basicchunk.js";

export class MediaBlockWithKeys extends GbxChunk {
    constructor(name, id, size) {
        super([], name, id, size);
        this.keys = [];
    }

    doParseBinary(p) {
        this.addTemplateAndValue(p, "numKeys", "uint32");
        for (let i = 0; i < this.numKeys; ++i) {
            const k = this.constructKey();
            k.parseBinary(p);
            this.keys.push(p);
        }
    }
}

function defineMediaBlockKey(name, template) {
    // Assigning a class/constructor to an object key names it after the key
    let o = {};
    o[name] = class extends GbxObject {
        constructor() {
            super(template, "MediaBlock" + name + "Key");
        }
    }
    return o[name];
}

function defineMediaBlock(name, keyClass) {
    let o = {};
    o[name] = class extends MediaBlockWithKeys {
        constructor(id, size) {
            super("MediaBlock" + name, id, size);
        }

        constructKey() {
            return new keyClass();
        }
    }
    return o[name];
}

var CameraPathKey = defineMediaBlockKey("CameraPath", [
    ["timeStamp", "float"],
    ["cameraPosition", "vec3"],
    ["pitch", "float"],
    ["yaw", "float"],
    ["roll", "float"],
    ["FOV", "float"],
    ["anchorRot", "bool"],
    ["indexTargetPlayer", "uint32"],
    ["anchorVis", "bool"],
    ["indexAnchorPlayer", "uint32"],
    ["targetPosition", "vec3"],
    ["weight", "float"],
    ["f1", "float"],
    ["f2", "float"],
    ["f3", "float"],
    ["f4", "float"],

]);
export var MediaBlockCameraPath = defineMediaBlock("CameraPath", CameraPathKey);

var CameraCustomKey = defineMediaBlockKey("CameraCustom", [
    ["timeStamp", "float"],
    ["interpolation", "uint32"],
    ["unused", "uint64"],
    ["cameraPosition", "vec3"],
    ["pitch", "float"],
    ["yaw", "float"],
    ["roll", "float"],
    ["FOV", "float"],
    ["anchorRot", "bool"],
    ["indexTargetPlayer", "uint32"],
    ["anchorVis", "bool"],
    ["indexAnchorPlayer", "uint32"],
    ["targetPosition", "vec3"],
    ["weight", "float"],
    ["leftTangentX", "float"],
    ["leftTangentY", "float"],
    ["leftTangentZ", "float"],
    ["rightTangentX", "float"],
    ["rightTangentY", "float"],
    ["rightTangentZ", "float"]
]);
export var MediaBlockCameraCustom =
    defineMediaBlock("CameraCustom", CameraCustomKey);

var CameraEffectShakeKey = defineMediaBlockKey("CameraEffectShake", [
    ["timeStamp", "float"],
    ["intensity", "float"],
    ["speed", "float"]
]);
export var MediaBlockCameraEffectShake =
    defineMediaBlock("CameraEffectShake", CameraEffectShakeKey);

var MusicEffectKey = defineMediaBlockKey("MusicEffect", [
    ["timeStamp", "float"],
    ["musicVolume", "float"],
    ["soundVolume", "float"]
]);
export var MediaBlockMusicEffect =
    defineMediaBlock("MusicEffect", MusicEffectKey);

var Sound01Key = defineMediaBlockKey("Sound01", [
    ["timeStamp", "float"],
    ["volume", "float"],
    ["pan", "float"]
]);
export var MediaBlockSound01 = defineMediaBlock("Sound01", Sound01Key);

var Sound04Key = defineMediaBlockKey("Sound04", [
    ["timeStamp", "float"],
    ["volume", "float"],
    ["pan", "float"],
    ["soundTransmitterPosition", "vec3"]
]);
export class MediaBlockSound04 extends GbxChunk {
    constructor(id, size) {
        super([], "MediaBlockSound04", id, size);
        this.keys = [];
    }

    doParseBinary(p) {
        this.addTemplateAndValue(p, "sound", "fileref");
        this.addTemplateAndValue(p, "ignored", "uint32");
        this.addTemplateAndValue(p, "numKeys", "uint32");
        for (let i = 0; i < this.numKeys; ++i) {
            const k = new Sound04Key();
            k.parseBinary(p);
            this.keys.push(p);
        }
    }
}

var TransitionFadeKey = defineMediaBlockKey("TransitionFade", [
    ["timeStamp", "float"],
    ["opacity", "float"],
]);
export class MediaBlockTransitionFade extends GbxChunk {
    constructor(id, size) {
        super([], "MediaBlockTransitionFade", id, size);
        this.keys = [];
    }

    doParseBinary(p) {
        for (let i = 0; i < this.numKeys; ++i) {
            const k = new TransitionFadeKey();
            k.parseBinary(p);
            this.keys.push(p);
        }
        this.addTemplateAndValue(p, "transitionColor", "color");
        this.addTemplateAndValue(p, "ignored", "uint32");
    }
}

const FxColorsAdditionalParameters = makeGbxSubclass(
        "FxColorsAdditionalParameters", [
            ["inverse", "float"],
            ["hue", "float"],
            ["saturation", "float"],
            ["contrast", "float"],
            ["color", "color"],
            ["a", "float"], ["b", "float"], ["c", "float"], ["d", "float"]
        ]);

var FXColorsKey = defineMediaBlockKey("FxColors", [
    ["timeStamp", "float"],
    ["intensity", "float"],
    ["blendZ", "float"],
    ["distanceNear", "float"],
    ["distanceFar", "float"],
    ["additionalParametersNear", FxColorsAdditionalParameters],
    ["additionalParametersFar", FxColorsAdditionalParameters]
]);
export var MediaBlockFxColors = defineMediaBlock("FxColors", FxColorsKey);

var FxBlurDepthKey = defineMediaBlockKey("FxBlurDepth", [
    ["timeStamp", "float"],
    ["lensSize", "float"],
    ["forceFocus", "bool"],
    ["pan", "float"]
]);
export var MediaBlockFxBlurDepth =
        defineMediaBlock("FxBlurDepth", FxBlurDepthKey);

var FxBloomKey = defineMediaBlockKey("FxBloom", [
    ["timeStamp", "float"],
    ["intensity", "float"],
    ["sensitivity", "float"]
]);
export var MediaBlockFxBloom =
        defineMediaBlock("FxBloom", FxBloomKey);

var TimeKey = defineMediaBlockKey("Time", [
    ["timeStamp", "float"],
    ["timeValue", "float"],
    ["tangent", "float"]
]);
export var MediaBlockTime =
        defineMediaBlock("Time", TimeKey);

var ThreeDStereoKey = defineMediaBlockKey("ThreeDStereo", [
    ["timeStamp", "float"],
    ["separation", "float"],
    ["screenDist", "float"]
]);
export var MediaBlockThreeDStereo =
        defineMediaBlock("ThreeDStereo", ThreeDStereoKey);

