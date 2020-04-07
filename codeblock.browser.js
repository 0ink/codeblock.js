
const ESPRIMA = require("esprima");
const REGEXP_ESCAPE = require("escape-string-regexp");


var Codeblock = exports.Codeblock = function (code, format, args) {
    this[".@"] = "github.com~0ink~codeblock/codeblock:Codeblock";
    if (
        typeof code === "object" &&
        code.hasOwnProperty("raw") &&
        Object.keys(code).length === 1
    ) {
        this._code = code.raw;
    } else {
        if (code) {
            this.setCode(code);
        } else {
            this._code = "";
        }
    }
    this._format = format;
    this._args = args;
    this._compiled = false;
}
Codeblock.prototype.toString = function () {
    var obj = JSON.stringify(this);
    // TODO: We should probably be returning a string instead of an object here?
    return JSON.parse(obj);
}
Codeblock.prototype.getCode = function () {
    return linesForEscapedNewline(this._code).join("\n");
}
Codeblock.prototype.setCode = function (code) {
    this._code = code.replace(/\\n/g, "___NeWlInE_KeEp_OrIgInAl___")
        .replace(/\n/g, "\\n")
        .replace(/(___NeWlInE_KeEp_OrIgInAl___)/g, "\\$1");
}
Codeblock.prototype.getFormat = function () {
    return this._format;
}
Codeblock.prototype.compile = function (variables) {
    variables = variables || {};
    var code = this.getCode();

    // Do not compile variables within '(___WrApCoDe___("javascript", ["data"], "' and '", "___WrApCoDe___END")'
    // Replace segments with placeholders and put back after below.
    var segments = {};
    var re = /(\(___WrApCoDe___\("javascript", \[[^\]]*\], ")(.*?)(", "___WrApCoDe___END"\)\))/g;
    var match = null;
    while ( (match = re.exec(code)) ) {
        var segmentKey = '___SeGmEnT___' + Object.keys(segments) + '___';
        segments[segmentKey] = match[0];
        code = code.replace(
            new RegExp(REGEXP_ESCAPE(segments[segmentKey]), "g"),
            segmentKey
        );
    }

    // TODO: Use common helper
    var re = /(?:^|\n)(.*?)(["']?)(%%%([^%]+)%%%)(["']?)/;
    var match = null;
    var skipSearches = [];
    while ( true ) {
        match = code.match(re);
        if (!match) break;

        var searchString = match[3];
        var varValue = variables;

        if (typeof varValue === "function") {
            varValue = varValue(match[4]);
        } else {
            var varParts = match[4].split(".");
            while (varParts.length > 0) {
                varValue = varValue[varParts.shift()];
                if (typeof varValue === "undefined") {
                    console.error("variables", variables);
                    throw new Error("Variable '" + match[4] + "' not found while processing code section!");
                }
            }
        }

        if (
            !varValue ||
            typeof varValue.toString !== "function"
        ) {
            console.error("searchString", searchString);
            console.error("varValue", varValue);
            throw new Error("Value does not have a toString() function!");
        }

        var val = varValue.toString().split("\n").map(function (line, i) {
            if (i > 0) {
                line = match[1] + line;
            }
            return line;
        }).join("\n");

        if (match[2] === "'" && match[5] === "'") {
            val = "'" + val.replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
            searchString = "'" + searchString + "'";
        } else
        if (match[2] === '"' && match[5] === '"') {
            val = '"' + val.replace(/\\/g, "\\\\").replace(/"/g, "\\\"") + '"';
            searchString = '"' + searchString + '"';
        }
        if (
            typeof varValue === 'object' &&
            varValue.replaceVariables === false
        ) {
            skipSearches.push(val);
            val = '__VAL__' + (skipSearches.length - 1) + '__';
        }

        var codeBefore = code;
        code = code.replace(new RegExp(REGEXP_ESCAPE(searchString), "g"), val);
    }
    skipSearches.forEach(function (val, i) {
        code = code.replace(new RegExp('__VAL__' + i + '__', "g"), val);
    });

    // Do not compile variables within '(___WrApCoDe___("javascript", ["data"], "' and '", "___WrApCoDe___END")'
    // Replace placeholders from above with original code.
    Object.keys(segments).forEach(function (segmentKey) {
        code = code.replace(
            new RegExp(REGEXP_ESCAPE(segmentKey), "g"),
            segments[segmentKey]
        );
    });

    code = code.replace(/\\n/g, "\\\\n");
    code = code.replace(/\n/g, "\\n");

    var codeblock = new Codeblock({raw: code}, this._format, this._args);
    codeblock._compiled = true;

    return codeblock;
}
Codeblock.prototype.run = function (variables, options) {
    variables = variables || {};
    options = options || {};
    const VM = exports.VM;
    if (!VM) {
        throw new Error("No 'VM' available!");
    }
    if (!this._compiled) {
        var codeblock = this.compile(variables);
        return codeblock.run(variables, options);
    }
    var code = this.getCode();
    if (exports.DEBUG) {
        console.log("[codeblock] variables:", Object.keys(variables));
        console.log("[codeblock] options:", Object.keys(options));
        console.log("[codeblock] Code to execute in VM", code);
    }
    try {
        var script = new VM.Script([
            'RESULT = (function (',
            this._args.join(', '),
            ') { ',
            code.replace(/&#96;/g, "\`"),
            ' }).apply(THIS, ARGS);'
        ].join(""));
    } catch (err) {
        console.log("this._code", this._code);
        console.log("code", code);
        throw err;
    }
    var sandbox = {
        console: console,
        RESULT: undefined,
        THIS: options["this"] || null,
        ARGS: this._args.map(function (name) {
            return variables[name];
        }),
        ___WrApCoDe___: ___WrApCoDe___
    };
    if (options.sandbox) {
        Object.keys(options.sandbox).forEach(function (name) {
            sandbox[name] = options.sandbox[name];
        });
    }
    script.runInNewContext(sandbox);
    return sandbox.RESULT;
}
Codeblock.prototype.runAsync = async function (variables, options) {
    variables = variables || {};
    options = options || {};
    const VM = exports.VM;
    if (!VM) {
        throw new Error("No 'VM' available!");
    }
    if (!this._compiled) {
        var codeblock = this.compile(variables);
        return codeblock.runAsync(variables, options);
    }
    var code = this.getCode();
    if (exports.DEBUG) {
        console.log("[codeblock] variables:", Object.keys(variables));
        console.log("[codeblock] options:", Object.keys(options));
        console.log("[codeblock] Code to execute in VM", code);
    }
    try {
        var script = new VM.Script([
            'RUNNER = async function (',
            this._args.join(', '),
            ') { ',
            code.replace(/&#96;/g, "\`"),
            ' }'
        ].join(""));
    } catch (err) {
        console.log("this._code", this._code);
        console.log("code", code);
        throw err;
    }
    var sandbox = {
        console: console,
        RESULT: undefined,
        THIS: options["this"] || null,
        ARGS: this._args.map(function (name) {
            return variables[name];
        }),
        ___WrApCoDe___: ___WrApCoDe___
    };
    if (options.sandbox) {
        Object.keys(options.sandbox).forEach(function (name) {
            sandbox[name] = options.sandbox[name];
        });
    }
    script.runInNewContext(sandbox);

    sandbox.RESULT = await sandbox.RUNNER.apply(sandbox.THIS, sandbox.ARGS);

    return sandbox.RESULT;
}
Codeblock.thaw = function (ice) {
    if (typeof ice === "string") {
        ice = JSON.parse(ice);
    } else {
        // Copy string
        ice = JSON.parse(JSON.stringify(ice));
    }
    var code = ice.this;
    delete ice.this;
    var format = ice._format;
    delete ice._format;
    var args = ice._args;
    delete ice._args;
    var inst = new Codeblock({raw: code}, format, args);
    Object.keys(ice).forEach(function (key) {
        inst[key] = ice[key];
    });
    return inst;
}

// TODO: Document
// TODO: Write test
// NOTE: This is a synchronous function!
exports.requireJSON = function (path) {
    return exports.purifySync(path, {
        freezeToJSON: true,
        skipFrozenJSONVerify: true
    }).code;
}

// TODO: Document
// TODO: Write test
// NOTE: This is a synchronous function!
exports.require = function (path) {
    var purified = exports.purifySync(path);
    if (purified.purifiedPath) {
        return require(purified.purifiedPath);
    }
    return require(purified.sourcePath);
}



function linesForEscapedNewline (rawCode) {
    var lines = [];

    var segments = rawCode.split(/([\\]*\\n)/);

    // if (
    //     segments.length === 1 &&
    //     segments[0].indexOf("\n") !== -1
    // ) {
    //     return rawCode.split("\n");
    // }

    for (var i=0; i<segments.length ; i++) {
        if (i % 2 === 0) {
            lines.push(segments[i]);
        } else
        if (segments[i] !== "\\n") {
            lines[lines.length - 1] += segments[i].replace(/\\\\/g, "\\") + segments[i + 1];
            i++;
        }
    }
    lines = lines.map(function (line) {
        return line.replace(/\\\n/g, "\\n");        
    });

    return lines;
}


// @see https://github.com/bahmutov/really-need/blob/master/index.js#L142
var ___WrApCoDe___WrappedCodeblock___Signature = 'function WrappedCodeblock(variables, Codeblock) {';
function ___WrApCoDe___ (format, args, _code) {
    return function WrappedCodeblock (variables, Codeblock) {
        var code = _code;
        function linesForEscapedNewline (rawCode) {
            var lines = [];
            var segments = rawCode.split(/([\\]*\\n)/);
            for (var i=0; i<segments.length ; i++) {
                if (i % 2 === 0) {
                    lines.push(segments[i]);
                } else
                if (segments[i] !== "\n") {
                    lines[lines.length - 1] += segments[i] + segments[i + 1];
                    i++;
                }
            }
            return lines;
        }
        var cleanedCode = linesForEscapedNewline(code);
        cleanedCode = cleanedCode.join("\n");
        const moduleUri = "$$__filename$$";
        return new (Codeblock || require(moduleUri).Codeblock)({raw: cleanedCode}, format, args);
    };
}



function validateCode (code) {
    if (exports.DEBUG) console.log("validateCode >>>>".yellow);
    if (exports.DEBUG) process.stdout.write(code + "\n");
    if (exports.DEBUG) console.log("<<<< validateCode".yellow);
    try {
        var syntax = ESPRIMA.parse(code, {
            tolerant: true
        });
        if (syntax.errors.length) {
            console.error("syntax.errors", syntax.errors);
            throw new Error("Error parsing JavaScript in Codeblock!");
        }
    } catch (err) {
        console.error("code", code);
        throw err;
    }
}


exports.jsonFunctionsToJavaScriptCodeblocks = function (codeIn) {

    if (exports.DEBUG) console.log("jsonFunctionsToJavaScriptCodeblocks IN >>>>".yellow);
    if (exports.DEBUG) process.stdout.write(codeIn + "\n");
    if (exports.DEBUG) console.log("<<<< jsonFunctionsToJavaScriptCodeblocks IN".yellow);

    // Upgrade ': function /*CodeBlock*/ () {\n}' to ': (javascript () >>>\n<<<)'
    // TODO: Make this more reliable.
    var lines = codeIn.split("\n");

    // Replace all matches starting with the last one until none are left

    function iterate () {

        var matches = [];

        // Detect matches
        lines.forEach(function (line, i) {
            var funcRe = /^(.+?)\s*function\s*\/\*\s*CodeBlock\s*\*\/\s*\(([^\)]*)\)\s*\{(.*)$/ig;
            var match = null;
            while ( (match = funcRe.exec(line)) ) {
                matches.push(i);
            }
        });

        if (matches.length === 0) {
            return;
        }

        var lastMatch = matches.pop();

        lines.forEach(function (line, i) {
            var funcRe = /^(.+?)\s*function\s*\/\*\s*CodeBlock\s*\*\/\s*\(([^\)]*)\)\s*\{(.*)$/ig;
            var match = null;
            if (i === lastMatch) {
                while ( (match = funcRe.exec(line)) ) {
                    lines[i] = match[1] + " (javascript (" + match[2] + ") >>>";
                    var segment = match[3];
                    var offset = 0;
                    var count = 1;
                    var buffer = [];
                    while (true) {
                        count += (segment.match(/\{/g) || []).length;
                        count -= (segment.match(/\}/g) || []).length;
                        if (count === 0) {
                            lines[i + offset] = lines[i + offset].replace(/\}(\s*,?)/, "<<<)$1");
                            // TODO: Fix indent.
                            buffer.unshift('function JavaScript_in_CodeBlock (' + match[2] + ') {');
                            buffer.push('}');
                            var rawJSCode = buffer.join("\n");
                            var purifiedJSCode = exports.purifyCode(rawJSCode).toString();
                            validateCode(purifiedJSCode);
                            break;
                        }
                        offset += 1;
                        if (lines.length < (i + offset)) {
                            throw new Error("No closing bracket found for opening line:", line);
                        }
                        buffer.push(segment);
                        segment = lines[i + offset];
                    }
                }
            }
        });

        if (matches.length > 0) {
            iterate();
        }
    }

    iterate();

    var codeOut = lines.join("\n");

    if (exports.DEBUG) console.log("jsonFunctionsToJavaScriptCodeblocks OUT >>>>".yellow);
    if (exports.DEBUG) process.stdout.write(codeOut + "\n");
    if (exports.DEBUG) console.log("<<<< jsonFunctionsToJavaScriptCodeblocks OUT".yellow);

    return codeOut;
}

exports.purifyCode = function (codeIn, options) {

    if (exports.DEBUG) console.log("PURIFY CODE >>>>".yellow);
    if (exports.DEBUG) process.stdout.write(codeIn + "\n");
    if (exports.DEBUG) console.log("<<<< PURIFY CODE".yellow);

    options = options || {};
    if (options.freezeToJSON && options.freezeToJavaScript) {
        throw new Error("The 'freezeToJSON' and 'freezeToJavaScript' options are mutually exclusive!");
    }

    function notifyOnCodeblock (codeblock) {
        if (
            !options.on ||
            !options.on.codeblock
        ) {
            return;
        }
        try {
            return options.on.codeblock(codeblock);
        } catch (err) {
            console.error("Error while running 'on.codeblock':", err);
            throw err;
        }
    }

    // TODO: Only recompile if need be. Need to keep cache in memory and on disk.

    if (typeof codeIn.replace !== "function") {
        console.error("codeIn", codeIn);
        throw new Error("'codeIn' does not appear to be a string as it does not have a 'replace' function!");
    }

    var preparedCodeIn = codeIn.replace(/\\n/g, "___NeWlInE_KeEp_OrIgInAl___");

    var code = exports.jsonFunctionsToJavaScriptCodeblocks(preparedCodeIn).replace(/\n/g, "\\n");

    if (exports.DEBUG) console.log("code >>>>".yellow);
    if (exports.DEBUG) process.stdout.write(code + "\n");
    if (exports.DEBUG) console.log("<<<< code".yellow);

    function purifyLayer (code, inSubLayer) {

        // Resolve codeblocks one layer at a time starting with the deepest.
        var hasMoreLayers = false;
        var layerSegments = code.split(/(>>>|<<<)/);

        for (var i=0; i < layerSegments.length; i++) {
            if (/^TEST_[^\n]+$/.test(layerSegments[i])) {
                layerSegments[i-2] += layerSegments.splice(i-1, i+3).pop();
                i -= 1;
            }
        }

        if (layerSegments.length > 5) {
            var layerSegmentDepth = {};
            var currentDepth = 0;
            var maxDepth = 0;
            layerSegments.forEach(function (segment, i) {
                if (segment === '>>>') {
                    currentDepth += 1;
                    maxDepth = Math.max(maxDepth, currentDepth);
                }
                layerSegmentDepth[i] = currentDepth;
                if (segment === '<<<') {
                    currentDepth -= 1;
                }
            });
            hasMoreLayers = true;
            code = layerSegments.map(function (segment, i) {
                if (layerSegmentDepth[i] < maxDepth) {
                    if (segment === '>>>') {
                        return '#>#>#>';
                    } else
                    if (segment === '<<<') {
                        return '<#<#<#';
                    }
                }
                return segment;
            }).join("");
        }

        var re = /(?:\(|=|,|\?)\s*(([\w\d\.:]+)\s*\(([^\)]*)\)\s+>{3}\s*\\n(.*?)\\n\s*<{3})\s*(?:\\n|\)|;)/g;

        var matchedSegments = [];

        while ( (match = re.exec(code)) ) {
            matchedSegments.push(match);
        }

        matchedSegments.forEach(function (match) {

            if (exports.DEBUG) console.log("match >>>>".yellow);
            if (exports.DEBUG) console.log(match);
            if (exports.DEBUG) console.log("<<<< match".yellow);

            var args = match[3].replace(/\s/g, "");
            args = (args !== "") ? args.split(",") : [];

            var lines = match[4].split("\\n");

            var lineCounts = {
                start: 0,
                end: 0
            };
            // Strip empty lines from start
            while (true) {
                if (!/^[\s\t]*$/.test(lines[0])) {
                    break;
                }
                lines.shift();
                lineCounts.start += 1;
            }
            // Strip empty lines from end
            while (true) {
                if (!/^[\s\t]*$/.test(lines[lines.length-1])) {
                    break;
                }
                lines.pop();
                lineCounts.end += 1;
            }

            // Skip commented out lines starting with '#' or '//'
            if (options.stripComments !== false) {
                lines = lines.filter(function (line) {
                    var keep = (!/^[\s\t]*(#(?!#)(?!\!)|\/\/)/.test(line));
                    if (!keep) {
                        if (process.env.VERBOSE) console.log("Ignore line:", line);
                    }
                    return keep;
                });
            }

            // Normalize indenting
            if (lines[0]) {
                var lineRe = new RegExp("^" + REGEXP_ESCAPE(lines[0].match(/^([\t\s]*)/)[0]));
                lines = lines.map(function (line, i) {
                    return line.replace(lineRe, "");
                });
            }

            for (var i = 0; i < lineCounts.start ; i++) {
                lines.unshift("");
            }
            for (var i = 0; i < lineCounts.end ; i++) {
                lines.push("");
            }

            if (exports.DEBUG) console.log("lines >>>>".yellow);
            if (exports.DEBUG) process.stdout.write(lines.join("\n") + "\n");
            if (exports.DEBUG) console.log("<<<< lines".yellow);
            if (exports.DEBUG) console.log("options".yellow, options);

            if (options.freezeToJSON) {

                var replacement = new Codeblock(
                    {
                        raw: restoreStringBlocks(lines
                            .join("\\n")
                            .replace(/(___NeWlInE_KeEp_OrIgInAl___)/g, "\\$1")), //.replace(/\\n/g, "___NeWlInE___")
                    },
                    match[2],
                    args
                );

                var ret = notifyOnCodeblock(replacement);
                if (typeof ret !== "undefined") {
                    replacement = ret;
                }

                replacement = replacement.toString();

                code = code.replace(
                    //new RegExp(REGEXP_ESCAPE('(' + match[1] + ')'), "g"),
                    '(' + match[1] + ')',
                    (
                        hasMoreLayers ?
                            JSON.stringify(replacement)
                            :
                            JSON.stringify(replacement, null, 4)
                    )
                );

            } else
            if (options.freezeToJavaScript) {

                var replacement = new Codeblock(
                    {
                        raw: restoreStringBlocks(lines
                            .join("\\n")
                            .replace(/(___NeWlInE_KeEp_OrIgInAl___)/g, "\\$1")), //.replace(/\\n/g, "___NeWlInE___")
                    },
                    match[2],
                    args
                );

                var ret = notifyOnCodeblock(replacement);
                if (typeof ret !== "undefined") {
                    replacement = ret;
                }
                
                if (replacement.getFormat() === "javascript") {

                    replacement = replacement.getCode();

                    if (!/^[\s\n]*function/.test(replacement)) {
                        replacement = [
                            'function () {',
                            replacement,
                            '}'
                        ].join("\n");
                    }

                } else {
                    // TODO: Implement other formatters

                    replacement = replacement.toString();
                    
                    replacement = (
                        hasMoreLayers ?
                            JSON.stringify(replacement)
                            :
                            JSON.stringify(replacement, null, 4)
                    );
                }

                code = code.replace(
                    new RegExp(REGEXP_ESCAPE('(' + match[1] + ')'), "g"),
                    replacement
                );

            } else {
/*
                lines = lines.map(function (line) {
                    // Escape '(___WrApCoDe___("javascript", ["data"], "' and '", "___WrApCoDe___END")'
                    var re = /(\(___WrApCoDe___\("javascript", \[[^\]]*\], ")(.*?)(", "___WrApCoDe___END"\)\))/g;
                    var match = null;
                    while ( (match = re.exec(line)) ) {
                        line = line.replace(
                            new RegExp(REGEXP_ESCAPE(match[0]), "g"),
                            [
                                match[1],
                                match[2]
                                    .replace(/___NeWlInE_KeEp___/g, '___NeWlInE_KeEp_Escaped___')
                                    .replace(/___NeWlInE___/g, '___NeWlInE_Escaped___'),
                                match[3]
                            ].join("")
                        );
                    }
                    return line;
                });
*/

                var replacement = [
                    '___WrApCoDe___("' + match[2] + '", ' + JSON.stringify(args) + ', "',
                    lines.join("\\n")
                        .replace(/\\/g, '\\\\')
                        .replace(/"/g, '\\"')
                        .replace(/___NeWlInE_KeEp_OrIgInAl___/g, "\\\\\\\\n"),
//                        .replace(/\\n/g, "___NeWlInE___"),
                    '", "___WrApCoDe___END")'
                ].join("");

                if (
                    options.on &&
                    options.on.codeblock
                ) {
                    throw new Error("Implement 'on.codeblock' for !freezeToJSON");
                    // TODO: Convert 'replacement' to proper Codeblock, notify, and then convert back.
                    //notifyOnCodeblock(replacement);
                }

                if (exports.DEBUG) console.log("replace >>>>".yellow);
                if (exports.DEBUG) process.stdout.write(match[1] + "\n");
                if (exports.DEBUG) console.log("<<<< replace".yellow);
                if (exports.DEBUG) console.log("replacement >>>>".yellow);
                if (exports.DEBUG) process.stdout.write(replacement + "\n");
                if (exports.DEBUG) console.log("<<<< replacement".yellow);

                code = code.replace(new RegExp(REGEXP_ESCAPE(match[1]), "g"), replacement);
            }
        });

        if (hasMoreLayers) {
            code = purifyLayer(
                code
                    .replace(/#>#>#>/g, '>>>')
                    .replace(/<#<#<#/g, '<<<'),
                true
            );
        }

        if (inSubLayer) {
            if (!hasMoreLayers) {

//                code = code.replace(/\\{3}"/g, '__QUOTE_PRE3__');
//                code = code.replace(/\\{2}/g, "\\\\\\");
            }
            return code;
        }

        // NOTE: We run this multiple times to ensure all CONSEQUTIVE newlines are replaced.
        // TODO: Tweak regexp to replace consequtive newlines in one replacement.
        code = code.replace(/([^\\]|^)\\n/g, "$1\n");
        code = code.replace(/([^\\]|^)\\n/g, "$1\n");
        code = code.replace(/([^\\]|^)\\n/g, "$1\n");
        code = code.replace(/([^\\]|^)\\n/g, "$1\n");

        // Add common functionality to file.
        if (
            options.freezeToJSON ||
            options.freezeToJavaScript
        ) {
            // We do not need to add anything to a frozen JSON file.
        } else {
//            code = ___WrApCoDe___.toString().replace(/\\/g, "\\\\").replace(/\$\$__filename\$\$/g, __dirname) + ";\n" + code;

            var shebang = code.match(/^(#!.+\n)/);
            if (shebang) {
                code = code.replace(/^#!.+\n/, '');
            }

            code = (
                (shebang && shebang[1]) || ''
            ) + ___WrApCoDe___.toString().replace(
                /\$\$__filename\$\$/g,
                options.standalone ?
                    require.resolve("./codeblock.rt0") :
                    (options.codeblockPackageUri || __dirname)
            ) + ";\n" + code;
        }


//        code = code.replace(/___NeWlInE___/g, "\\n");
//        code = code.replace(/___NeWlInE_Escaped___/g, "\\\\n");

        if (
            options.freezeToJSON &&
            !options.skipFrozenJSONVerify
        ) {
            // We validate the JSON to make sure. Some errors do not get caught when
            // using esprima to validate JavaScript blocks.
            // TODO: Use https://github.com/trentm/json
            try {
                JSON.parse(code);
            } catch (err) {
                console.log("codeIn", codeIn);
                console.log("code", code);
                console.error(err.stack);
                throw new Error("Syntax error in codeblock!");
            }
        }

//        code = code.replace(/___NeWlInE_KeEp___/g, "\\\\n");
//        code = code.replace(/___NeWlInE_KeEp_Escaped___/g, "\\\\\\n");
//        code = code.replace(/__QUOTE_PRE3__/g, '\\\\\\"');

        return code;
    }

    if (/>{3}\s*\\n(.*?)\\n\s*<{3}/.test(code)) {

        // Temporary replace all strings denoted with ` ... ` so that codeblocks within
        // the strings do not get touched.
        // TODO: Optionally compile codeblocks in strings to JSON
        var stringBlocks = [];
        if (/\`/.test(code)) {
            var match = null;
            var re = /(?:^|[^\`])\`([^\`]+)\`(?:[^\`]|$)/g;
            while ( (match = re.exec(code)) ) {
                var key = Object.keys(stringBlocks).length;
                stringBlocks[key] = match[1];
            }
            if (stringBlocks.length) {
                stringBlocks.forEach(function (blockCode, i) {                    
                    code = code.replace(new RegExp(REGEXP_ESCAPE(blockCode), "g"), "___StRiNg_BlOcC_" + i + "___");
                });
            }
        }

        function restoreStringBlocks (code) {
            if (!stringBlocks.length) {
                return code;
            }
            stringBlocks.forEach(function (blockCode, i) {                    
                code = code.replace(new RegExp("___StRiNg_BlOcC_" + i + "___", "g"), blockCode);
            });
            return code;
        }
    
        var codeOut = purifyLayer(code);

        codeOut = codeOut.replace(/___NeWlInE_KeEp_OrIgInAl___/g, "\\n");

        if (exports.DEBUG) console.log("PURIFIED CODE >>>>".yellow);
        if (exports.DEBUG) process.stdout.write(codeOut + "\n");
        if (exports.DEBUG) console.log("<<<< PURIFIED CODE".yellow);

        codeOut = new String(restoreStringBlocks(codeOut));
        codeOut._foundBlocks = true;
        return codeOut;
    }
    
    return codeIn;
}


exports.freezeToJSON = function (obj) {
    const TRAVERSE = require("traverse");
    return JSON.stringify(TRAVERSE(obj).map(function (value) {
        if (
            value instanceof Codeblock
        ) {
            value = value.toString();
        } else
        if (
            typeof value === "function"
            // TODO: Test function type.
        ) {
            value = value().toString();
        }
        this.update(value);
    }));
}

exports.freezeToSource = function (obj, options) {
    options = options || {};
    const TRAVERSE = require("traverse");
    var segments = [];
    var source = TRAVERSE(obj).map(function (value) {
        if (
            value &&
            typeof value === "object" &&
            value['.@'] === 'github.com~0ink~codeblock/codeblock:Codeblock'
        ) {
            var codeblock = value;
            segments.push(function (indent) {

                var code = [
                    "(" + codeblock._format + " (" + codeblock._args.join(", ") + ") >>>"
                ];
                var rawCode = codeblock._code;

                if (exports.DEBUG) console.log("rawCode >>>>".yellow);
                if (exports.DEBUG) process.stdout.write(rawCode + "\n");
                if (exports.DEBUG) console.log("<<<< rawCode".yellow);

                /*
                    // Convert '(___WrApCoDe___("javascript", [...], " ... "___WrApCoDe___END")' back to '... >>> ... <<<'
                    var re = /\(___WrApCoDe___\("javascript", \[([^\]]*)\], "(.*?)", "___WrApCoDe___END"\)\)/g;
                    var match2 = null;
                    while ( (match2 = re.exec(rawCode)) ) {
                        rawCode = rawCode.replace(
                            new RegExp(REGEXP_ESCAPE(match2[0]), "g"),
                            [
                                "(javascript (" + match2[1].replace(/"/g, "") + ") >>>",
                                match2[2].split(/\\n/).map(function (line) {
                                    return ("    " + line);
                                }).join("\n"),
                                "<<<)"
                            ].join("\n")
                        );
                    }
                */

                var lines = linesForEscapedNewline(rawCode);

                code = code.concat(lines.map(function (line, i) {
                    return ("    " + line);
                }));
                code = code.concat("<<<)");

                code = code.map(function (line, i) {            
                    if (i === 0) return line;
                    return (indent + line);
                }).join("\n");

                return code;
            });
            value = "___BlOcK___" + (segments.length - 1) + "___";
        } else
        if (typeof value === "function") {
            var func = value.toString().replace(/^(function\s)/, "$1/* CodeBlock */ ");
            if (options.oneline) {
                func = func.replace(/\n/g, " ");
            }
            segments.push(function (indent) {
                return func;
            });
            value = "___BlOcK___" + (segments.length - 1) + "___";
        }
        this.update(value);
    });
    if (options.oneline) {
        source = JSON.stringify(source);    
    } else {
        source = JSON.stringify(source, null, 4);    
    }
    var re = null;
    var replacer = null;
    var segmentMatchIndex = null;
    var replaceMatchIndex = null;
    if (options.oneline) {
        re = /("___BlOcK___(\d+)___")/g;
        segmentMatchIndex = 2;
        replaceMatchIndex = 1;
    } else {
        re = /(?:$|\n)(\s*)(.*?)("___BlOcK___(\d+)___")/g;
        segmentMatchIndex = 4;
        replaceMatchIndex = 3;
    }
    var match = null;
    while ( (match = re.exec(source)) ) {
        var indent = "";
        for (var i=0;i<match[1].length;i++) indent += " ";
        var code = segments[parseInt(match[segmentMatchIndex])](indent);
        source = source.replace(new RegExp(REGEXP_ESCAPE(match[replaceMatchIndex]), "g"), code);
    }
    return source;
}

exports.thawFromJSON = function (json) {
    const TRAVERSE = require("traverse");
    if (typeof json === "string") {
        if (exports.DEBUG) console.error("thawFromJSON >>>>");
        if (exports.DEBUG) process.stderr.write(json + "\n");
        if (exports.DEBUG) console.error("<<<< thawFromJSON");
        try {
            if (exports.JSONLINT) exports.JSONLINT.parse(json);
            json = JSON.parse(json);
        } catch (err) {
            console.error("json:", json);
            throw new Error("Error thawing JSON due to JSON syntax error");
        }
    }
    return TRAVERSE(json).map(function (value) {
        if (
            typeof value === "string" &&
            /^\{"\.@":"github\.com~0ink~codeblock\/codeblock:Codeblock"/.test(value)
        ) {
            value = Codeblock.thaw(value);
        } else
        if (exports.isCodeblock(value)) {
            value = Codeblock.thaw(value);
        }
        this.update(value);
    });
}


exports.compile = function (obj, args) {
    if (
        typeof obj === "object" &&
        obj['.@'] === 'github.com~0ink~codeblock/codeblock:Codeblock'
    ) {
        if (typeof obj.compile !== "function") {
            obj = Codeblock.thaw(obj);
        }
        obj = obj.compile(args);
    } else {
        throw new Error("'obj' not a codeblock");
    }
    return obj;
}

exports.isCodeblock = function (obj) {
    return (
        typeof obj === "object" &&
        obj['.@'] === 'github.com~0ink~codeblock/codeblock:Codeblock'
    );
}

exports.compileAll = function (obj) {
    const TRAVERSE = require("traverse");
    return TRAVERSE(obj).map(function (value) {
        if (exports.isCodeblock(value)) {
            value = value.compile(this.parent.node);
        }
        this.update(value);
    });
}


exports.run = function (obj, args, options) {
    if (
        typeof obj === "function" &&
        obj.toString().split("\n")[0] === ___WrApCoDe___WrappedCodeblock___Signature
    ) {
        obj = obj(args, exports.Codeblock);
    }
    if (exports.isCodeblock(obj)) {
        if (typeof obj.compile !== "function") {
            obj = Codeblock.thaw(obj);
        }
        obj = obj.compile(args);
    }
    if (
        typeof obj === "object" &&
        obj instanceof Codeblock
    ) {
        return obj.run(args, options);
    }
    return obj;
}

exports.runAsync = async function (obj, args, options) {
    if (
        typeof obj === "function" &&
        obj.toString().split("\n")[0] === ___WrApCoDe___WrappedCodeblock___Signature
    ) {
        obj = obj(args, exports.Codeblock);
    }
    if (exports.isCodeblock(obj)) {
        if (typeof obj.compile !== "function") {
            obj = Codeblock.thaw(obj);
        }
        obj = obj.compile(args);
    }
    if (
        typeof obj === "object" &&
        obj instanceof Codeblock
    ) {
        return obj.runAsync(args, options);
    }
    return obj;
}

exports.runAll = function (obj, args, options) {
    if (typeof options === "undefined") {
        options = args;
        args = {};
    }
    const TRAVERSE = require("traverse");
    function makeContext (self) {
        var ctx = {};
        Object.keys(self.parent.node).forEach(function (name) {
            ctx[name] = self.parent.node[name];
        });
        Object.keys(args).forEach(function (name) {
            ctx[name] = args[name];
        });
        return ctx;
    }
    return TRAVERSE(obj).map(function (value) {
        var self = this;
        if (
            typeof value === "function" &&
            value.toString().split("\n")[0] === ___WrApCoDe___WrappedCodeblock___Signature
        ) {
            self.update(value(makeContext(self), exports.Codeblock));
        }
        if (
            typeof value === "object" &&
            value instanceof Codeblock &&
            value.getFormat() === "javascript"
        ) {
            self.update(value.run(makeContext(self), options));
        }
    });
}
