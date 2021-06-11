import {GbxChunk} from "../chunk.js";

import {TMDesc} from "./TmDesc.js";
import {Common} from "./Common.js";
import {Version} from "./Version.js";
import {Community} from "./Community.js";
import {Thumbnail} from "./Thumbnail.js";
import {Author} from "./Author.js";
import {CollectorList} from "./CollectorList.js";
import {ChallengeBlocks} from "./ChallengeBlocks.js";
import {ArchiveGmCam} from "./ArchiveGmCam.js";
import {MediaClip, MediaClipGroup} from "./MediaClip.js";
import {MediaTrack01} from "./MediaTrack.js";
import * as m from "./MediaBlock.js";

GbxChunk.registry.set(0x03043002, TMDesc);
GbxChunk.registry.set(0x03043003, Common);
GbxChunk.registry.set(0x03043004, Version);
GbxChunk.registry.set(0x03043005, Community);
GbxChunk.registry.set(0x03043007, Thumbnail);
GbxChunk.registry.set(0x03043008, Author);
GbxChunk.registry.set(0x03043013, ChallengeBlocks);
GbxChunk.registry.set(0x0304301f, ChallengeBlocks);
GbxChunk.registry.set(0x03043027, ArchiveGmCam);
GbxChunk.registry.set(0x03043028, ArchiveGmCam);

GbxChunk.registry.set(0x0301b000, CollectorList);

GbxChunk.registry.set(0x03078001, MediaTrack01);

GbxChunk.registry.set(0x03079002, MediaClip);
GbxChunk.registry.set(0x03079003, MediaClip);
GbxChunk.registry.set(0x03079005, MediaClip);
GbxChunk.registry.set(0x0307900d, MediaClip);
GbxChunk.registry.set(0x0307a003, MediaClipGroup);

GbxChunk.registry.set(0x030a1002, m.MediaBlockCameraPath);
GbxChunk.registry.set(0x030a1005, m.MediaBlockCameraCustom);
GbxChunk.registry.set(0x030a4000, m.MediaBlockCameraEffectShake);
GbxChunk.registry.set(0x030a6001, m.MediaBlockMusicEffect);
GbxChunk.registry.set(0x030a7001, m.MediaBlockSound01);
GbxChunk.registry.set(0x030a7004, m.MediaBlockSound04);
GbxChunk.registry.set(0x030ab000, m.MediaBlockTransitionFade);
GbxChunk.registry.set(0x03080003, m.MediaBlockFxColors);
GbxChunk.registry.set(0x03081001, m.MediaBlockFxBlurDepth);
GbxChunk.registry.set(0x03083001, m.MediaBlockFxBloom);
GbxChunk.registry.set(0x03085000, m.MediaBlockTime);
GbxChunk.registry.set(0x03024000, m.MediaBlockThreeDStereo);
GbxChunk.registry.set(0x030e5002, m.MediaBlockGhost02);
GbxChunk.registry.set(0x03029001, m.MediaBlockTriangles);
GbxChunk.registry.set(0x07010003, m.MediaBlockControlEffectSimi03);
GbxChunk.registry.set(0x07010004, m.MediaBlockControlEffectSimi);
GbxChunk.registry.set(0x07010005, m.MediaBlockControlEffectSimi);
