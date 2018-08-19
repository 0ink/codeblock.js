#!/usr/bin/env bash.origin.test via github.com/mochajs/mocha

const FS = require("fs");
const ASSERT = require('assert');
const CODEBLOCK = require("../..");

describe('Codeblock Require', function () {

    it('dynamic compile', function () {

        var exports = CODEBLOCK.makeRequire(require)("./rep.js");

        ASSERT.deepEqual(exports.block1(), {
            ".@": "github.com~0ink~codeblock/codeblock:Codeblock",
            "_code": "\\nreturn \"Hello World 1\";\\n",
            "_format": "javascript",
            "_args": [],
            "_compiled": false
        });

        ASSERT.deepEqual(exports.block2(), {
            ".@": "github.com~0ink~codeblock/codeblock:Codeblock",
            "_code": "\\nHello World 2\\n",
            "_format": "text:plain",
            "_args": [],
            "_compiled": false
        });
    });

    it('cached compile', function () {

        if (FS.existsSync(".~rep.js~purified.js")) {
            FS.unlinkSync(".~rep.js~purified.js");
        }

        var exports = CODEBLOCK.makeRequire(require, {
            cacheCompiled: true
        })("./rep.js");

        ASSERT.deepEqual(exports.block1(), {
            ".@": "github.com~0ink~codeblock/codeblock:Codeblock",
            "_code": "\\nreturn \"Hello World 1\";\\n",
            "_format": "javascript",
            "_args": [],
            "_compiled": false
        });

        ASSERT.deepEqual(exports.block2(), {
            ".@": "github.com~0ink~codeblock/codeblock:Codeblock",
            "_code": "\\nHello World 2\\n",
            "_format": "text:plain",
            "_args": [],
            "_compiled": false
        });

        exports = require("./.~rep.js~purified.js");

        ASSERT.deepEqual(exports.block1(), {
            ".@": "github.com~0ink~codeblock/codeblock:Codeblock",
            "_code": "\\nreturn \"Hello World 1\";\\n",
            "_format": "javascript",
            "_args": [],
            "_compiled": false
        });

        ASSERT.deepEqual(exports.block2(), {
            ".@": "github.com~0ink~codeblock/codeblock:Codeblock",
            "_code": "\\nHello World 2\\n",
            "_format": "text:plain",
            "_args": [],
            "_compiled": false
        });
    });


    

});
