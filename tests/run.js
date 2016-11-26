
require("colors");

const ASSERT = require("assert");
const PATH = require("path");
const FS = require("fs");
const DIFF = require("diff");
const UTIL = require("util");

const CODEBLOCK = require("../codeblock");


function log () {
    if (!process.env.VERBOSE) {
        return;
    }
    console.log.apply(console, arguments);
}

function showDiff (actual, expected) {
    if (actual === expected) return;
    log("|=== DIFF ===>");
    // @see https://github.com/kpdecker/jsdiff
    var diff = DIFF.diffWordsWithSpace(
        expected,
        actual
    );
    diff.forEach(function(part) {
        var color = part.added ? 'green' : part.removed ? 'red' : 'grey';
        process.stderr.write(part.value[color]);
    });
    log("<=== DIFF ===|");
}


// Parse codeblocks in required modules
CODEBLOCK.patchGlobalRequire();

// Load JS Source using NodeJS 'require' overlay
const TEST = require(PATH.resolve("main.js")).TEST;
log('obj', UTIL.inspect(TEST, { showHidden: true, depth: null }));
log("obj", JSON.stringify(TEST, null, 4));

// Freeze from JS Object to JSON
var frozen = CODEBLOCK.freezeToJSON(TEST);
log("frozen", JSON.stringify(JSON.parse(frozen), null, 4));


// That from JSON to JS Object again
var obj = CODEBLOCK.thawFromJSON(frozen);
log('obj', UTIL.inspect(TEST, { showHidden: true, depth: null }));
log("obj", JSON.stringify(obj, null, 4));


// Re-Freeze from JS Object to JSON
var refrozen = CODEBLOCK.freezeToJSON(obj);
log("refrozen", JSON.stringify(JSON.parse(refrozen), null, 4));

ASSERT.deepEqual(refrozen, frozen);


// Freeze from JS Object back to original JS Source
var source = CODEBLOCK.freezeToSource(obj);
source = [
    "",
    "exports" + ".TEST = " + source.split("\n").map(function (line) {
        if (/^[\s\t]+$/.test(line)) {
            line = "";
        }
        return line;
    }).join("\n") + ";",
    ""
].join("\n")
log("source", source);

if (source !== FS.readFileSync("main.js", "utf8")) {
    // TODO: Signal fail
}
showDiff(FS.readFileSync("main.js", "utf8"), source);


// Prepare all codeblocks for running
FS.writeFileSync(".parsed.js", JSON.stringify(obj, null, 4), "utf8");
var made = CODEBLOCK.makeAll(obj);
log("made", JSON.stringify(made, null, 4));
if (process.env.VERBOSE) {
    FS.writeFileSync(".made.js", JSON.stringify(made, null, 4), "utf8");
} else {
    if (JSON.stringify(made, null, 4) !== FS.readFileSync(".made.js", "utf8")) {
        // TODO: Signal fail
    }
}
showDiff(FS.readFileSync(".made.js", "utf8"), JSON.stringify(made, null, 4));

// Run all codeblocks and verify results
var result = CODEBLOCK.runAll(made);
log("result", JSON.stringify(result, null, 4));
if (process.env.VERBOSE) {
    FS.writeFileSync(".result.js", JSON.stringify(result, null, 4), "utf8");
} else {
    if (JSON.stringify(result, null, 4) !== FS.readFileSync(".result.js", "utf8")) {
        // TODO: Signal fail
    }
}
showDiff(FS.readFileSync(".result.js", "utf8"), JSON.stringify(result, null, 4));
