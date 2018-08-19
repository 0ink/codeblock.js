#!/usr/bin/env bash.origin.test via github.com/mochajs/mocha

const FS = require("fs");
const ASSERT = require('assert');
const CODEBLOCK = require("../..");

describe('Nested as String', function () {

    it('dynamic compile', function () {

        if (FS.existsSync(".~rep.js~codeblock-purified.js")) {
            FS.unlinkSync(".~rep.js~codeblock-purified.js");
        }

        var exports = CODEBLOCK.makeRequire(require, {
            cacheCompiled: false
        })("./rep.js");

        ASSERT.deepEqual(exports.block1(), {
            ".@": "github.com~0ink~codeblock/codeblock:Codeblock",
            "_code": "\\nreturn \"Hello World 1\";\\n",
            "_format": "javascript",
            "_args": [],
            "_compiled": false
        });

        ASSERT.equal(exports.block2, '(text:plain () >>>\n\n        Hello World 2\n\n    <<<)');

        if (FS.existsSync(".~rep.js~codeblock-purified.js")) {
            throw new Error("'.~rep.js~codeblock-purified.js' should not exist!");
        }
    });

    it('cached compile', function () {

        var exports = CODEBLOCK.makeRequire(require)("./rep.js");

        ASSERT.deepEqual(exports.block1(), {
            ".@": "github.com~0ink~codeblock/codeblock:Codeblock",
            "_code": "\\nreturn \"Hello World 1\";\\n",
            "_format": "javascript",
            "_args": [],
            "_compiled": false
        });

        ASSERT.equal(exports.block2, '(text:plain () >>>\n\n        Hello World 2\n\n    <<<)');

        exports = require("./.~rep.js~codeblock-purified.js");

        ASSERT.deepEqual(exports.block1(), {
            ".@": "github.com~0ink~codeblock/codeblock:Codeblock",
            "_code": "\\nreturn \"Hello World 1\";\\n",
            "_format": "javascript",
            "_args": [],
            "_compiled": false
        });

        ASSERT.equal(exports.block2, '(text:plain () >>>\n\n        Hello World 2\n\n    <<<)');
    });

});
