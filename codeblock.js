
const REGEXP_ESCAPE = require("escape-string-regexp");


var Codeblock = exports.Codeblock = function (code, format) {
    this[".@"] = "github.com~0ink~codeblock/codeblock:Codeblock";
    this._code = code;
    this._format = format;
}
Codeblock.prototype.toString = function () {
    return JSON.stringify(this);
}
Codeblock.prototype.make = function (variables) {
    var code = this._code;
    var re = /(?:^|\n)(.*?)(%%%([^%]+)%%%)/g;
    var match = null;
    while ( (match = re.exec(code)) ) {
        var varParts = match[3].split("/");
        var val = variables;
        while (varParts.length > 0) {
            val = val[varParts.shift()];
            if (typeof val === "undefined") {
                throw new Error("Variable '" + match[3] + "' not declared while processing code section in file '" + uri + "'!");
            }
        }
        code = code.replace(new RegExp(REGEXP_ESCAPE(match[2]), "g"), val.split("\n").map(function (line, i) {
            if (i > 0) {
                line = match[1] + line;
            }
            return line;
        }).join("\n"));
    }
    return new Codeblock(code, this._format);
}
Codeblock.thaw = function (ice) {
    if (typeof ice === "string") {
        ice = JSON.parse(ice);
    }
    var code = ice.this;
    delete ice.this;
    var format = ice._format;
    delete ice._format;
    var inst = new Codeblock(code, format);
    Object.keys(ice).forEach(function (key) {
        inst[key] = ice[key];
    });
    return inst;
}



exports.freezeToJSON = function (obj) {
    const TRAVERSE = require("traverse");
    return JSON.stringify(TRAVERSE(obj).map(function (value) {
        if (
            typeof value === "function"
            // TODO: Test function type.
        ) {
            value = value().toString();
        } else
        if (
            typeof value === "object" &&
            value['.@'] === 'github.com~0ink~codeblock/codeblock:Codeblock'
        ) {
            value = value.toString();
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
            "(" + codeblock._format + " () >>>",
            "",
            codeblock._code.split("\n").map(function (line, i) {
                return ("    " + line);
            }).join("\n"),
            "",
            "<<<)"
        ].map(function (line, i) {
            if (i === 0) return line;
            return (indent + line);
        }).join("\n");
        source = source.replace(new RegExp(REGEXP_ESCAPE(match[3]), "g"), code);
    }

    return source;
}

exports.thawFromJSON = function (json) {
    const TRAVERSE = require("traverse");
    return TRAVERSE(JSON.parse(json)).map(function (value) {
        if (
            typeof value === "string" &&
            /^\{"\.@":"github\.com~0ink~codeblock\/codeblock:Codeblock"/.test(value)
        ) {
            value = Codeblock.thaw(value);
        }
        this.update(value);
    });
}

exports.makeAll = function (obj, data) {
    const TRAVERSE = require("traverse");
    return TRAVERSE(obj).map(function (value) {
        if (
            typeof value === "object" &&
            value['.@'] === 'github.com~0ink~codeblock/codeblock:Codeblock'
        ) {
            value = value.make(data);
        }
        this.update(value);
    });
}


exports.patchGlobalRequire = function () {

    const PATH = require("path");
    const FS = require("fs");

    // @see https://github.com/bahmutov/really-need/blob/master/index.js
    var Module = require('module');

    // @see https://github.com/bahmutov/really-need/blob/master/index.js#L142
    function ___WrApCoDe___ (format, _code, uri) {
        return function (variables) {
            var code = _code;
            var re = /(?:$|\n)(.*?)(%{3}([^%]+)%{3})/g;
            var match = null;
            while ( (match = re.exec(code)) ) {
                var varParts = match[3].split("/");
                var val = variables;
                while (varParts.length > 0) {
                    val = val[varParts.shift()];
                    if (typeof val === "undefined") {
                        throw new Error("Variable '" + match[3] + "' not declared while processing code section in file '" + uri + "'!");
                    }
                }
                code = code.replace(new RegExp(REGEXP_ESCAPE(match[2]), "g"), val.split("\n").map(function (line, i) {
                    if (i > 0) {
                        line = match[1] + line;
                    }
                    return line;
                }).join("\n"));
            }
            return new (require("$$__filename$$").Codeblock)(code, format);
        };
    }
    var originalRequire = Module.prototype.require;
    Module.prototype.require = function (uri) {

        var path = Module._resolveFilename(uri, this);
        if (FS.existsSync(path)) {
            var code = FS.readFileSync(path, "utf8");

            code = code.replace(/\n/g, '\\n');
            var re = /(?:\(|=|,|\?)\s*(([\w\d]+)\s*\(\)\s+>{3}\s*\\n(.*?)\\n\s*<{3})\s*(?:\\n|\)|;)/g;

            if (/>{3}\s*\\n(.*?)\\n\s*<{3}/.test(code)) {

                var match = null;
                while ( (match = re.exec(code)) ) {
                    var lines = match[3].split("\\n");
                    // Strip empty lines from start
                    while (true) {
                        if (!/^[\s\t]*$/.test(lines[0])) {
                            break;
                        }
                        lines.shift();
                    }
                    // Strip empty lines from end
                    while (true) {
                        if (!/^[\s\t]*$/.test(lines[lines.length-1])) {
                            break;
                        }
                        lines.pop();
                    }
                    var lineRe = new RegExp("^" + REGEXP_ESCAPE(lines[0].match(/^([\t\s]*)/)[0]));
                    lines = lines.map(function (line, i) {
                        return line.replace(lineRe, "");
                    });
                    code = code.replace(new RegExp(REGEXP_ESCAPE(match[1]), "g"), [
                        '___WrApCoDe___("' + match[2] + '", "',
                        lines.join("\\n").replace(/"/g, '\\"').replace(/\\n/g, "___NeWlInE___"),
                        '","' + uri + '")'
                    ].join(""));
                }
                code = ___WrApCoDe___.toString().replace(/\$\$__filename\$\$/g, __dirname) + ";\n" + code.replace(/\\n/g, "\n").replace(/___NeWlInE___/g, "\\n");


                var mod = new Module(path, this);
                mod.parent = this;
                mod.filename = path;
                mod.paths = Module._nodeModulePaths(PATH.dirname(path));
                mod.loaded = true;
                mod._compile(code, path);
                Module._cache[path] = mod;
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
