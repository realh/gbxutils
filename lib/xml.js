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
        return this.childNodes[0];
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
