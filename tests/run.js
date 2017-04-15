
const COLORS = require("colors");
COLORS.enabled = true;


const ASSERT = require("assert");
const PATH = require("path");
const FS = require("fs");
const DIFF = require("diff");
const UTIL = require("util");
const RESOLVE = require("resolve");
const CODEBLOCK = require("../codeblock");


function log () {
    if (!process.env.VERBOSE) {
        return;
    }
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[run.js]'.yellow);
    args.unshift("\n");
    console.log.apply(console, args);
}

function showDiff (actual, expected, label) {
    if (actual === expected) return;
    // @see https://github.com/kpdecker/jsdiff
    var diff = DIFF.diffWordsWithSpace(
        expected,
        actual
    );
/*    
    var found = false;
    // Ignore differences due to whitespace.
    diff.forEach(function(part) {
        if (
            (
                part.added &&
                part.value.replace(/\s+/, "") === ""
            ) ||
            (
                part.removed &&
                part.value.replace(/\s+/, "") === ""
            )
        ) {
            found = true;
        }
    });
    if (!found) {
        return;
    }
*/
    log((label + " |=== DIFF ===>").red);
    diff.forEach(function(part) {
        var color = part.added ? 'green' : part.removed ? 'red' : 'grey';
        process.stderr.write(COLORS[color](part.value));
    });
    log(("<=== DIFF ===| " + label).red);
}



// Parse codeblocks in required JavaScript modules
CODEBLOCK.patchGlobalRequire();



// Load JavaScript Source using NodeJS 'require' overlay
const TEST = require(PATH.resolve("main.js")).TEST;
log('OBJ:'.cyan, UTIL.inspect(TEST, { showHidden: true, depth: null }));
log("OBJ:".cyan, JSON.stringify(TEST, null, 4));



// Freeze from JavaScript Object to JSON
var frozen = CODEBLOCK.freezeToJSON(TEST);
log("FROZEN:".cyan, JSON.stringify(JSON.parse(frozen), null, 4));



// Thaw from JSON to JavaScript Object again
var obj = CODEBLOCK.thawFromJSON(frozen);
log('OBJ:'.cyan, UTIL.inspect(obj, { showHidden: true, depth: null }));
log("OBJ:".cyan, JSON.stringify(obj, null, 4));



// Re-Freeze from JavaScript Object to JSON
var refrozen = CODEBLOCK.freezeToJSON(obj);
log("REFROZEN:".cyan, JSON.stringify(JSON.parse(refrozen), null, 4));

ASSERT.deepEqual(refrozen, frozen);



// Freeze from JavaScript Object back to original JS Source
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
log("SOURCE:".cyan, source);

if (source !== FS.readFileSync("main.js", "utf8")) {
    // TODO: Signal fail
}
showDiff(
    CODEBLOCK.jsonFunctionsToJavaScriptCodeblocks(
        FS.readFileSync("main.js", "utf8")
    ),
    source,
    'SOURCE'
);



// Compile all codeblocks for running
FS.writeFileSync(".parsed.js", JSON.stringify(obj, null, 4), "utf8");
var compiled = CODEBLOCK.compileAll(obj);
log("COMPILED:".cyan, JSON.stringify(compiled, null, 4));
if (process.env.VERBOSE) {
    FS.writeFileSync(".compiled.js", JSON.stringify(compiled, null, 4), "utf8");
} else {
    if (JSON.stringify(compiled, null, 4) !== FS.readFileSync(".compiled.js", "utf8")) {
        // TODO: Signal fail
    }
}
showDiff(
    FS.readFileSync(".compiled.js", "utf8"),
    JSON.stringify(compiled, null, 4),
    'COMPILED'
);



// Run all codeblocks and verify results
var result = CODEBLOCK.runAll(compiled, {
    sandbox: {
        require: function (uri) {
            var path = RESOLVE.sync(uri, {
                basedir: process.cwd()
            });
            return require(path);
        },
        console: {
            log: function () {
                var args = Array.prototype.slice.call(arguments);
                args.unshift('OUTPUT'.magenta);
                log.apply(null, args);    
            }
        }
    }
});
log("RESULT:".cyan, JSON.stringify(result, null, 4));
if (process.env.VERBOSE) {
    FS.writeFileSync(".result.js", JSON.stringify(result, null, 4), "utf8");
} else {
    if (JSON.stringify(result, null, 4) !== FS.readFileSync(".result.js", "utf8")) {
        // TODO: Signal fail
    }
}
showDiff(
    FS.readFileSync(".result.js", "utf8"),
    JSON.stringify(result, null, 4),
    'RESULT'
);
