import {GbxObject} from "./gbxobject.js";
import {sax} from "./sax.js";

export class GbxXml extends GbxObject {
    constructor() {
        super([]);
        this.name = "root";
    }

    parse(xml) {
        this.childNodes = [];
        this.currentNode = this;
        const parser = sax.parser(true);    // strict = true
        parser.onopentag = (node) =>
        {
            const child = new XmlNode(node.name, this.currentNode);
            child.attributes = node.attributes;
            this.currentNode.childNodes.push(child);
            this.currentNode = child;
        }
        parser.onclosetag = () => {
            this.currentNode = this.currentNode.parent;
        }
        parser.ontext = (text) => {
            this.currentNode.childNodes.push(new XmlText(text));
        }
        parser.onerror = (err) => { throw err; }
        parser.write(xml).close();
        return this.rootNode = this.childNodes[0];
    }

    tm2ToNF() {
        this.rootNode.tm2ToNF();
    }

    toJSON() {
        return this.rootNode;
    }
}

class XmlNode {
    constructor(name, parent) {
        this.name = name;
        this.parent = parent;
        this.attributes = {};    // Easier to JSON.stringify() than a Map
        this.childNodes = [];
    }

    toXmlString() {
        let openTag = [this.name];
        for (const k of Object.getOwnPropertyNames(this.attributes)) {
            const v = this.attributes[k];
            openTag.push(`${k}="${escapeXmlStr(v)}"`);
        }
        const closer = this.childNodes.length ? '' : '/';
        let s = `<${openTag.join(' ')}${closer}>`;
        for (const c of this.childNodes) {
            s += c.toXmlString();
        }
        if (closer == '') {
            s += '</' + this.name + '>';
        }
        return s;
    }

    tm2ToNF() {
        switch (this.name) {
        case "header":
            this.attributes.type = "challenge";
            this.attributes.version = "TMc.6";
            this.attributes.exever = "2.11.26";
            delete this.attributes.exebuild;
            delete this.attributes.title;
            delete this.attributes.lightmap;
            break;
        case "ident":
            delete this.attributes.authorzone;
            break;
        case "desc":
            delete this.attributes.maptype;
            delete this.attributes.mapstyle;
            delete this.attributes.validated;
            delete this.attributes.displaycost;
            delete this.attributes.hasghostblocks;
            break;
        case "dep":
            if (!this.attributes.url) {
                this.attributes.file = tm2DepToNF(this.attributes.file);
            }
            break;
        }
        for (let i = 0; i < this.childNodes.length; ++i) {
            const child = this.childNodes[i];
            if (child.name == "playermodel") {
                this.childNodes.splice(i, 1);
            } else {
                child.tm2ToNF();
            }
        }
    }

    toJSON() {
        return {
            name: this.name,
            attributes: this.attributes,
            childNodes: this.childNodes
        }
    }
}

class XmlText {
    constructor(text) {
        this.text = text;
    }

    toXmlString() {
        return escapeXmlStr(this.text);
    }

    toJSON() {
        return this.text;
    }
}

export function tm2DepToNF(s) {
    if (s.startsWith("Skins\\Any\\Advertisement\\Advert") &&
            s.endsWith(".dds"))
    {
        s = s.replace(/\.dds$/, ".zip");
    }
    return s;
}

let reverseEntities = null;

export function escapeXmlStr(s) {
    if (!reverseEntities) {
        reverseEntities = new Map();
        for (const ent in sax.XML_ENTITIES) {
            reverseEntities.set(sax.XML_ENTITIES[ent], ent);
        }
    }
    let result = "";
    for (let i = 0; i < s.length; ++i)
    {
        switch (s[i])
        {
        case '&':
            result += "&amp;";
            break;
        case '"':
            result += "&quot;";
            break;
        case "<":
            result += "&lt;";
            break;
        case ">":
            result += "&gt;";
            break;
        default:
            result += s[i];
        }
    }
    return result;
}
