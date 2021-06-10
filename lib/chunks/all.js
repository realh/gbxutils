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
import {MediaClip} from "./MediaClip.js";

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

GbxChunk.registry.set(0x03079002, MediaClip);
GbxChunk.registry.set(0x03079003, MediaClip);
GbxChunk.registry.set(0x03079005, MediaClip);
GbxChunk.registry.set(0x0307900d, MediaClip);
