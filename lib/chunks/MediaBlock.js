import {GbxChunk} from "../chunk.js";
import {GbxObject} from "../gbxobject.js";
import {makeGbxSubclass, makeChunkSubclass} from "../basicchunk.js";

export function parseKeys(p, constructKey) {
    const keys = [];
    const numKeys = p.uint32();
    for (let i = 0; i < numKeys; ++i) {
        const k = new constructKey();
        k.parseBinary(p);
        keys.push(p);
    }
    return keys;
}

export class MediaBlockWithKeys extends GbxChunk {
    constructor(name, id, size, keyClass) {
        super([], name, id, size);
        this.keyClass = keyClass;
        this.keys = [];
    }

    doParseBinary(p) {
        this.parseKeys(p);
    }

    parseKeys(p) {
        const keys = parseKeys(p, this.keyClass);
        this.numKeys = keys.length;
        this.template.push(["numKeys", "uint32"]);
        this.template.push(["keys", this.constructKey]);
    }
}

function defineMediaBlockKey(name, template) {
    if (template[0][0] != "timeStamp") {
        template.unshift(["timeStamp", "float"]);
    }
    // Assigning a class/constructor to an object key names it after the key
    let o = {};
    o[name] = class extends GbxObject {
        constructor() {
            super(template, "MediaBlock" + name + "Key");
        }
    }
    return o[name];
}

function defineMediaBlock(name, keyClass, doParseBinary) {
    let o = {};
    o[name] = class extends MediaBlockWithKeys {
        constructor(id, size) {
            super("MediaBlock" + name, id, size,keyClass);
        }
    }
    if (doParseBinary) {
        o[name].prototype.doParseBinary = doParseBinary;
    }
    return o[name];
}

var CameraPathKey = defineMediaBlockKey("CameraPath", [
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
    ["intensity", "float"],
    ["speed", "float"]
]);
export var MediaBlockCameraEffectShake =
    defineMediaBlock("CameraEffectShake", CameraEffectShakeKey);

var MusicEffectKey = defineMediaBlockKey("MusicEffect", [
    ["musicVolume", "float"],
    ["soundVolume", "float"]
]);
export var MediaBlockMusicEffect =
    defineMediaBlock("MusicEffect", MusicEffectKey);

var Sound01Key = defineMediaBlockKey("Sound01", [
    ["volume", "float"],
    ["pan", "float"]
]);
export var MediaBlockSound01 = defineMediaBlock("Sound01", Sound01Key,
    function(p) {
        this.addTemplateAndValue(p, "sound", "fileref");
        this.parseKeys(p);
    });

var Sound04Key = defineMediaBlockKey("Sound04", [
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
    ["opacity", "float"],
]);
export var MediaBlockTransitionFade =
    defineMediaBlock("MediaBlockTransitionFade", TransitionFadeKey,
        function(p) {
            this.parseKeys(p);
            this.addTemplateAndValue(p, "transitionColor", "color");
            this.addTemplateAndValue(p, "ignored", "uint32");
        });

const FxColorsAdditionalParameters = makeGbxSubclass(
        "FxColorsAdditionalParameters", [
            ["inverse", "float"],
            ["hue", "float"],
            ["saturation", "float"],
            ["contrast", "float"],
            ["color", "color"],
            ["a", "float"], ["b", "float"], ["c", "float"], ["d", "float"]
        ]);

var FxColorsKey = defineMediaBlockKey("FxColors", [
    ["intensity", "float"],
    ["blendZ", "float"],
    ["distanceNear", "float"],
    ["distanceFar", "float"],
    ["additionalParametersNear", FxColorsAdditionalParameters],
    ["additionalParametersFar", FxColorsAdditionalParameters]
]);
export var MediaBlockFxColors = defineMediaBlock("FxColors", FxColorsKey);

var FxBlurDepthKey = defineMediaBlockKey("FxBlurDepth", [
    ["lensSize", "float"],
    ["forceFocus", "bool"],
    ["pan", "float"]
]);
export var MediaBlockFxBlurDepth =
        defineMediaBlock("FxBlurDepth", FxBlurDepthKey);

var FxBloomKey = defineMediaBlockKey("FxBloom", [
    ["intensity", "float"],
    ["sensitivity", "float"]
]);
export var MediaBlockFxBloom =
        defineMediaBlock("FxBloom", FxBloomKey);

var TimeKey = defineMediaBlockKey("Time", [
    ["timeValue", "float"],
    ["tangent", "float"]
]);
export var MediaBlockTime =
        defineMediaBlock("Time", TimeKey);

var ThreeDStereoKey = defineMediaBlockKey("ThreeDStereo", [
    ["separation", "float"],
    ["screenDist", "float"]
]);
export var MediaBlockThreeDStereo =
        defineMediaBlock("ThreeDStereo", ThreeDStereoKey);

export var MediaBlockImage = makeChunkSubclass("MediaBlockImage", 0x30a5000,
        [["CControlEffectSimi", "noderef"], ["image", "fileref"]]);
export var MediaBlockSound02 = makeChunkSubclass("MediaBlockSound02", 0x30a7002,
        [["playCount", "uint32"], ["isLooping", "bool"]]);
export var MediaBlockSound03 = makeChunkSubclass("MediaBlockSound03", 0x30a7003,
        [], function(p) {
            this.addTemplateAndValue(p, "version", "uint32");
            this.addTemplateAndValue(p, "playCount", "uint32");
            this.addTemplateAndValue(p, "isLooping", "bool");
            this.addTemplateAndValue(p, "isMusic", "bool");
            if (this.version >= 1) {
                this.addTemplateAndValue(p, "stopWithClip", "bool");
            }
            if (this.version >= 2) {
                this.addTemplateAndValue(p, "audioToSpeech", "bool");
                this.addTemplateAndValue(p, "audioToSpeechTarget", "int");
            }
        });
export var MediaBlockText01 = makeChunkSubclass("MediaBlockText01", 0x030a8001,
        [["text", "string"], ["CControlEffectSimi", "noderef"]]);
export var MediaBlockText02 = makeChunkSubclass("MediaBlockText02", 0x030a8002,
        [["textColor", "color"]]);
export var MediaBlockTrails = makeChunkSubclass("MediaBlockTrails", 0x030a9000,
        [["timeClipStart", "float"], ["timeClipEnd", "float"]]);
export var MediaBlockFxBlurMotion = makeChunkSubclass("MediaBlockFxBlurMotion",
        0x3082000, [["timeClipStart", "float"], ["timeClipEnd", "float"]]);
export var MediaBlockControlCameraFree =
    makeChunkSubclass("MediaBlockControlCameraFree", 0x03084000,
    [["timeClipStart", "float"], ["timeClipEnd", "float"],
     ["cameraView", "lookbackstring"], ["indexTargetPlayer", "uint32"]]);
export var MediaBlockGhost01 = makeChunkSubclass("MediaBlockGhost01",
        0x030e5001, [["timeClipStart", "float"], ["timeClipEnd", "float"],
        ["ghostModel", "noderef"], ["startOffset", "float"]]);

var Ghost02Key = defineMediaBlockKey("Ghost02", [
    ["a", "float"]
]);
export var MediaBlockGhost02 = defineMediaBlock("Ghost02", Ghost02Key,
    function(p) {
        this.addTemplateAndValue(p, "version", "uint32");
        if (this.version < 3) {
            this.addTemplateAndValue(p, "timeClipStart", "float");
            this.addTemplateAndValue(p, "timeClipEnd", "float");
        } else {
            this.parseKeys(p);
        }
        this.addTemplateAndValue(p, "ghostModel", "noderef");
        this.addTemplateAndValue(p, "startOffset", "float");
        this.addTemplateAndValue(p, "noDamage", "bool");
        this.addTemplateAndValue(p, "forceLight", "bool");
        this.addTemplateAndValue(p, "forceHue", "bool");
    });

class MBTrianglesKeyPoints extends GbxObject {
    constructor() {
        super(["points", "array", "vec3"], "TrianglesKeyPoints");
    }

    readPoints(p, numPoints) {
        this.points = [];
        for (let i = 0; i < numPoints; ++i) {
            this.points.push(p.vec3());
        }
    }
}
var MBTrianglesPoint = makeGbxSubclass("TrianglesPoint",
        [["pointColor", "color"], ["opacity", "float"]]);
var MBTrianglesTriangle = makeGbxSubclass("TrianglesTriangle",
        [["v1", "uint32"], ["v2", "uint32"], ["v3", "uint32"]]);
export class MediaBlockTriangles extends GbxChunk {
    constructor(id, size) {
        super([], "MediaBlockTriangles", id, size);
    }

    doParseBinary(p) {
        this.timeStampKeys = [];
        this.addTemplateAndValue(p, "numTimeStampKeys", "uint32");
        for (let i = 0; i < this.numTimeStampKeys; ++i) {
            this.timeStampKeys.push(p.float());
        }
        this.template.push(["timeStampKeys", "array", "float"]);
        this.addTemplateAndValue(p, "numKeyPoints", "uint32");
        this.addTemplateAndValue(p, "numPointsPerKey", "uint32");
        this.keyPoints = [];
        for (let i = 0; i < this.numKeyPoints; ++i) {
            const kp = new MBTrianglesKeyPoints();
            kp.readPoints(p, this.numPointsPerKey);
            this.keyPoints.push(kp);
        }
        this.template.push(["keyPoints", "array", MBTrianglesKeyPoints]);
        this.points = parseKeys(p, MBTrianglesPoint);
        this.numPoints = this.points.length;
        this.template.push(["numPoints", "uint32"]);
        this.template.push(["points", "array", MBTrianglesPoint]);
        this.triangles = parseKeys(p, MBTrianglesTriangle);
        this.numTriangles = this.triangles.length;
        this.template.push(["numTriangles", "uint32"]);
        this.template.push(["triangles", "array", MBTrianglesTriangle]);
        this.template.push(["a", "uint32"], ["b", "uint32"], ["c", "uint32"], 
                ["d", "float"], ["e", "uint32"], ["f", "uint64"]);
    }
}

var controlEffectSimiKeyTemplate = [
    ["position", "vec2"],
    ["rotation", "float"],
    ["scaleX", "float"],
    ["scaleY", "float"],
    ["opacity", "float"],
    ["depth", "float"]
];
var ControlEffectSimi03Key = defineMediaBlockKey("ControlEffectSimi03",
        controlEffectSimiKeyTemplate);
export var MediaBlockControlEffectSimi03 =
    defineMediaBlock("ControlEffectSimi03", ControlEffectSimi03Key,
    function(p) {
        this.parseKeys(p);
        this.addTemplateAndValue(p, "centered", "bool");
    });
var ControlEffectSimi04Key = defineMediaBlockKey("ControlEffectSimi03",
        controlEffectSimiKeyTemplate.concat([
            ["a", "float"],
            // wiki says float, but I think that's a mistake, "is..." surely
            // means bool
            ["isContinuousEffect", "bool"],
            ["b", "float"],
            ["c", "float"]
        ]));
export var MediaBlockControlEffectSimi =
    defineMediaBlock("ControlEffectSimi", ControlEffectSimi04Key,
    function(p) {
        this.parseKeys(p);
        this.addTemplateAndValue(p, "centered", "bool");
        this.addTemplateAndValue(p, "colorBlendMode", "uint32");
        this.addTemplateAndValue(p, "isContinuousEffect", "bool");
        if (this.chunkID == 0x07010005) {
            this.addTemplateAndValue(p, "isInterpolated", "bool");
        }
    });
