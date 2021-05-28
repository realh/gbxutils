import {GbxChunk} from "../core/chunk.js";

import {TMDesc} from "./TmDesc.js";
import {Common} from "./Common.js";

GbxChunk.registry.set(0x03043002, TMDesc);
GbxChunk.registry.set(0x03043003, Common);
