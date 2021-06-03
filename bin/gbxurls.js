import {loadGbxFile, saveGbxFile} from "../lib/gbxfile.js";

// f is a function which takes a dep node as its argument
function iterateUrls(gbx, f) {
    for (const chunk of gbx.header.headerChunks) {
        if (chunk.name != "Community") { continue; }
        for (const node of chunk.xml.childNodes) {
            if (node.name != "deps") { continue; }
            for (const dep of node.childNodes) {
                if (dep.name != "dep" || !dep.attributes.url) { continue; }
                f(dep);
            }
        }
    }
}

function main() {
    const args = process.argv;
    const l = args.length;
    if (l != 3 && l != 6 && l != 7) {
        console.error(`Invalid arguments. Usage:
${args[0]} ${args[1]} 'input filename'
${args[0]} ${args[1]} 'input filename' 'output filename' 'match' 'replacement'
${args[0]} ${args[1]} 'input filename' 'output filename' 'match' ` +
`'replacement' 'flags'`
        );
        return;
    }
    const gbx = loadGbxFile(args[2], false);
    if (l == 3) {
        iterateUrls(gbx, (dep) => console.info(dep.attributes.url));
    } else {
        const re = (l == 7) ? new RegExp(args[4], args[6]) :
                              new RegExp(args[4]);
        iterateUrls(gbx, (dep) => {
            dep.attributes.url = dep.attributes.url.replace(re, args[5]);
        });
        saveGbxFile(args[3], gbx);
    }
}

main();
