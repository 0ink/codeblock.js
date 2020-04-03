
const PATH = require("path");
const FS = require("fs");
const JSONLINT = require("jsonlint");

exports.DEBUG = /(^|\s)codeblock(\s|$)/.test(process.env.DEBUG || "") || false;

if (exports.DEBUG) {
    // TODO: Use 'require("colors/safe")'
    require("colors");
}

const CODEBLOCK_BROWSER = require("./codeblock.browser");

Object.keys(CODEBLOCK_BROWSER).forEach(function (name) {
    exports[name] = CODEBLOCK_BROWSER[name];
});

CODEBLOCK_BROWSER.DEBUG = exports.DEBUG;
CODEBLOCK_BROWSER.VM = require('vm');
CODEBLOCK_BROWSER.JSONLINT = JSONLINT;



// TODO: Document
// TODO: Write test
exports.purifySync = function (path, options) {

    options = options || {};

    // We cache the compiled file by default
    if (typeof options.cacheCompiled === "undefined") {
        options.cacheCompiled = true;
    }

    // TODO: Use 'pinf-it' helper to generate cache path
    var purifiedPath = PATH.join(
        PATH.dirname(path),
        ".~" + PATH.basename(path) + "~codeblock-purified.js"
    );

    if (
        options.cacheCompiled &&
        FS.existsSync(purifiedPath) &&
        FS.statSync(purifiedPath).mtime.getTime() >= FS.statSync(path).mtime.getTime() &&
        !process.env.CODEBLOCK_FORCE_COMPILE
    ) {        
        return {
            sourcePath: path,
            code: FS.readFileSync(purifiedPath, "utf8"),
            purifiedPath: purifiedPath
        };
    }

    var code = path;
    if (/^\//.test(code)) {
        code = FS.readFileSync(path, "utf8");
    }
    code = exports.purifyCode(code, options);

    if (code._foundBlocks) {

        if (options.cacheCompiled) {
            // TODO: Make configurable
            //var compiledPath = LIB.PATH.join(path, "..", ".io/cache.modules", LIB.PATH.basename(path));
            FS.writeFileSync(purifiedPath, code, "utf8");
        }

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


var originalRequire = null;

exports.unpatchGlobalRequire = function () {
    if (!originalRequire) {
        throw new Error("Global require not patched");
    }
    var Module = require('module');
    Module.prototype.require = originalRequire;
    originalRequire = null;
}

// TODO: Use https://stackoverflow.com/a/42648141
exports.patchGlobalRequire = function () {

    // @see https://github.com/bahmutov/really-need/blob/master/index.js
    const Module = require('module');

    originalRequire = Module.prototype.require;
    Module.prototype.require = function (uri) {

        var path = Module._resolveFilename(uri, this);
        if (FS.existsSync(path)) {

            var purified = exports.purifySync(path);

            if (purified.purifiedPath) {

                if (exports.DEBUG) console.log("RUN CODE >>>>".yellow);
                if (exports.DEBUG) process.stdout.write(purified.code + "\n");
                if (exports.DEBUG) console.log("<<<< RUN CODE".yellow);

                var mod = new Module(purified.sourcePath, this);
                mod.parent = this;
                mod.filename = purified.sourcePath;
                mod.paths = Module._nodeModulePaths(PATH.dirname(purified.sourcePath));
                mod.loaded = true;
                mod._compile(purified.code.toString(), purified.sourcePath);
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

exports.makeRequire = function (moduleRequire, options) {

    options = options || {};

    // @see https://github.com/bahmutov/really-need/blob/master/index.js
    const Module = require('module');

    return function (uri) {

        var path = moduleRequire.resolve(uri);

        var purified = exports.purifySync(path, options);

        if (!purified.purifiedPath) {
            return moduleRequire(path);
        }

        if (exports.DEBUG) console.log("RUN CODE >>>>".yellow);
        if (exports.DEBUG) process.stdout.write(purified.code + "\n");
        if (exports.DEBUG) console.log("<<<< RUN CODE".yellow);

        var mod = new Module(purified.sourcePath, this);
        mod.parent = this;
        mod.filename = purified.sourcePath;
        mod.paths = Module._nodeModulePaths(PATH.dirname(purified.sourcePath));
        mod.loaded = true;
        mod._compile(purified.code.toString(), purified.sourcePath);
        Module._cache[purified.sourcePath] = mod;

        return mod.exports;
    }
}
