
const REGEXP_ESCAPE = require("escape-string-regexp");
const FS = require("fs");


var Codeblock = exports.Codeblock = function (code, format, args) {
    this[".@"] = "github.com~0ink~codeblock/codeblock:Codeblock";
    this._code = code;
    this._format = format;
    this._args = args;
    this._compiled = false;
}
Codeblock.prototype.toString = function () {
    var obj = JSON.stringify(this);
    return JSON.parse(obj);
}
Codeblock.prototype.compile = function (variables) {
    variables = variables || {};
    var code = this._code;
    var re = /(?:^|\n)(.*?)(%%%([^%]+)%%%)/g;
    var match = null;
    while ( (match = re.exec(code)) ) {
        var varParts = match[3].split(".");
        var val = variables;
        while (varParts.length > 0) {
            val = val[varParts.shift()];
            if (typeof val === "undefined") {
                console.error("variables", variables);
                throw new Error("Variable '" + match[3] + "' not found while processing code section!");
            }
        }
        code = code.replace(new RegExp(REGEXP_ESCAPE(match[2]), "g"), val.split("\n").map(function (line, i) {
            if (i > 0) {
                line = match[1] + line;
            }
            return line;
        }).join("\n"));
    }
    var codeblock = new Codeblock(code, this._format, this._args);
    codeblock._compiled = true;
    return codeblock;
}
Codeblock.prototype.run = function (variables, options) {
    variables = variables || {};
    options = options || {};
    const VM = require('vm');
    if (!this._compiled) {
        var codeblock = this.compile(variables);
        return codeblock.run(variables);
    }
    var script = new VM.Script('RESULT = (function (' + this._args.join(', ') + ') { ' + this._code + ' }).apply(THIS, ARGS);');
    var sandbox = {
        console: console,
        THIS: options["this"] || null,
        ARGS: this._args.map(function (name) {
            return variables[name];
        })
    };
    if (options.sandbox) {
        Object.keys(options.sandbox).forEach(function (name) {
            sandbox[name] = options.sandbox[name];
        });
    }
    script.runInNewContext(sandbox);
    return sandbox.RESULT || null;
}
Codeblock.thaw = function (ice) {
    if (typeof ice === "string") {
        ice = JSON.parse(ice);
    }
    var code = ice.this;
    delete ice.this;
    var format = ice._format;
    delete ice._format;
    var args = ice._args;
    delete ice._args;
    var inst = new Codeblock(code, format, args);
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
        freezeToJSON: true
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

// @see https://github.com/bahmutov/really-need/blob/master/index.js#L142
function ___WrApCoDe___ (format, args, _code) {
    return function WrappedCodeblock (variables) {
        var code = _code;
        return new (require("$$__filename$$").Codeblock)(code, format, args);
    };
}

// TODO: Document
// TODO: Write test
exports.purifySync = function (path, options) {

    options = options || {};

    // TODO: Only recompile if need be.

    var code = FS.readFileSync(path, "utf8");

    code = code.replace(/\n/g, '\\n');
    var re = /(?:\(|=|,|\?)\s*(([\w\d]+)\s*\(([^\)]*)\)\s+>{3}\s*\\n(.*?)\\n\s*<{3})\s*(?:\\n|\)|;)/g;

    if (/>{3}\s*\\n(.*?)\\n\s*<{3}/.test(code)) {

        var match = null;
        while ( (match = re.exec(code)) ) {

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
            var lineRe = new RegExp("^" + REGEXP_ESCAPE(lines[0].match(/^([\t\s]*)/)[0]));
            lines = lines.map(function (line, i) {
                return line.replace(lineRe, "");
            });

            for (var i = 0; i < lineCounts.start ; i++) {
                lines.unshift("");
            }
            for (var i = 0; i < lineCounts.end ; i++) {
                lines.push("");
            }


            if (options.freezeToJSON) {

                code = code.replace(
                    new RegExp(REGEXP_ESCAPE('(' + match[1] + ')'), "g"),
                    JSON.stringify((new Codeblock(
                        lines.join("\\n").replace(/\\n/g, "___NeWlInE___"),
                        match[2],
                        args
                    )).toString(), null, 4)
                );

            } else {

                code = code.replace(new RegExp(REGEXP_ESCAPE(match[1]), "g"), [
                    '___WrApCoDe___("' + match[2] + '", ' + JSON.stringify(args) + ', "',
                    lines.join("\\n").replace(/"/g, '\\"').replace(/\\n/g, "___NeWlInE___"),
                    '")'
                ].join(""));
            }
        }

        // Add common functionality to file.
        if (options.freezeToJSON) {
            // We do not need to add anything to a frozen JSON file.
        } else {
            code = ___WrApCoDe___.toString().replace(/\$\$__filename\$\$/g, __dirname) + ";\n" + code;
        }
        code = code.replace(/\\n/g, "\n").replace(/___NeWlInE___/g, "\\n");


        // TODO: Make configurable
        //var compiledPath = LIB.PATH.join(path, "..", ".io/cache.modules", LIB.PATH.basename(path));
        var purifiedPath = path + "~.pure.js";
        FS.writeFileSync(purifiedPath, code, "utf8");

        return {
            sourcePath: path,
            code: code,
            purifiedPath: purifiedPath
        };
    }

    return {
        sourcePath: path,
        code: code
    };
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

exports.freezeToSource = function (obj) {
    const TRAVERSE = require("traverse");
    var blocks = [];
    var source = JSON.stringify(TRAVERSE(obj).map(function (value) {
        if (
            typeof value === "object" &&
            value['.@'] === 'github.com~0ink~codeblock/codeblock:Codeblock'
        ) {
            blocks.push(value);
            value = "___BlOcK___" + (blocks.length - 1) + "___";
        }
        this.update(value);
    }), null, 4);


    var re = /(?:$|\n)(\s*)(.*?)("___BlOcK___(\d+)___")/g;
    var match = null;
    while ( (match = re.exec(source)) ) {
        var indent = "";
        for (var i=0;i<match[1].length;i++) indent += " ";

        var codeblock = blocks[parseInt(match[4])];

        var code = [
            "(" + codeblock._format + " (" + codeblock._args.join(", ") + ") >>>"
        ];
        code = code.concat(codeblock._code.split("\n").map(function (line, i) {
            return ("    " + line);
        }));
        code = code.concat("<<<)");
        code = code.map(function (line, i) {
            if (i === 0) return line;
            return (indent + line);
        }).join("\n");

        source = source.replace(new RegExp(REGEXP_ESCAPE(match[3]), "g"), code);
    }

    return source;
}

exports.thawFromJSON = function (json) {
    const TRAVERSE = require("traverse");
    if (typeof json === "string") {
        json = JSON.parse(json);
    }
    return TRAVERSE(json).map(function (value) {
        if (
            typeof value === "string" &&
            /^\{"\.@":"github\.com~0ink~codeblock\/codeblock:Codeblock"/.test(value)
        ) {
            value = Codeblock.thaw(value);
        } else
        if (
            typeof value === "object" &&
            value['.@'] === 'github.com~0ink~codeblock/codeblock:Codeblock'
        ) {
            value = Codeblock.thaw(value);
        }
        this.update(value);
    });
}

exports.compileAll = function (obj) {
    const TRAVERSE = require("traverse");
    return TRAVERSE(obj).map(function (value) {
        if (
            typeof value === "object" &&
            value['.@'] === 'github.com~0ink~codeblock/codeblock:Codeblock'
        ) {
            value = value.compile(this.parent.node);
        }
        this.update(value);
    });
}

exports.runAll = function (obj, options) {
    const TRAVERSE = require("traverse");
    return TRAVERSE(obj).map(function (value) {
        if (
            typeof value === "object" &&
            value instanceof Codeblock
        ) {
            value = value.run(this.parent.node, options);
        }
        this.update(value);
    });
}

exports.patchGlobalRequire = function () {

    const PATH = require("path");
    const FS = require("fs");

    // @see https://github.com/bahmutov/really-need/blob/master/index.js
    var Module = require('module');

    var originalRequire = Module.prototype.require;
    Module.prototype.require = function (uri) {

        var path = Module._resolveFilename(uri, this);
        if (FS.existsSync(path)) {

            var purified = exports.purifySync(path);

            if (purified.purifiedPath) {

                var mod = new Module(purified.sourcePath, this);
                mod.parent = this;
                mod.filename = purified.sourcePath;
                mod.paths = Module._nodeModulePaths(PATH.dirname(purified.sourcePath));
                mod.loaded = true;
                mod._compile(purified.code, purified.sourcePath);
                Module._cache[purified.sourcePath] = mod;
                return mod.exports;

                /*
                var compiledPath = LIB.PATH.join(path, "..", ".io/cache.modules", LIB.PATH.basename(path));
                LIB.FS.outputFileSync(compiledPath, code, "utf8");
                return originalRequire.call(this, compiledPath);
                */
            }
        }

        try {
            return originalRequire.call(this, uri);
        } catch (err) {
            console.error("ERROR require(uri)", uri);
            console.error(err.stack);
            throw err;
        }
    }
}
