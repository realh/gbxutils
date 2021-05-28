import {GbxChunk} from "../core/chunk.js";

import {TMDesc} from "./TmDesc.js";
import {Common} from "./Common.js";
import {Version} from "./Version.js";
import {Community} from "./Community.js";
import {Thumbnail} from "./Thumbnail.js";
import {Author} from "./Author.js";

GbxChunk.registry.set(0x03043002, TMDesc);
GbxChunk.registry.set(0x03043003, Common);
GbxChunk.registry.set(0x03043004, Version);
GbxChunk.registry.set(0x03043005, Community);
GbxChunk.registry.set(0x03043007, Thumbnail);
GbxChunk.registry.set(0x03043008, Author);
