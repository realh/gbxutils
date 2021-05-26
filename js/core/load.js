const {file_get_contents} = imports.gi.GLib;
const {GbxBytesParser} = imports.core.parser;
const {GbxHeader} = imports.core.header;
const {GbxReferenceTable} = imports.core.reftable;

function loadGbx(filename) {
    const [success, bytes] = file_get_contents(filename);
    if (!success) {
        throw Error(`Unable to load ${filename}`);
    }
    let parser = new GbxBytesParser(bytes);
    const header = new GbxHeader(parser);
    const refTable = new GbxReferenceTable(parser);
    return {header, refTable};
}
