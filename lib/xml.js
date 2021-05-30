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
            openTag.push(`${k} = "${GLib.markup_escape_text(v, -1)}"`);
        }
        let s = '<' + openTag.join(' ') + '>';
        for (const c of this.childNodes) {
            s += c.toXmlString();
        }
        s += '</' + this.name + '>';
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
        this.verbatim = text.startsWith("<!--");
    }

    toXmlString() {
        return this.verbatim ?
            this.text : GLib.markup_escape_text(this.text, -1);
    }

    toJSON() {
        return this.text;
    }
}
