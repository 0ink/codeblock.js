#!/usr/bin/env bash.origin.test via github.com/mochajs/mocha

const PATH = require("path");
const FS = require("fs");
const ASSERT = require('assert');
const CODEBLOCK = require("../..");

describe('Freeze to JSON', function() {

    var purified = null;

    it('Purify Code Sync', function() {

        var code = FS.readFileSync(PATH.join(__dirname, "rep.js"), "utf8");

        var blockNumber = 0;

        purified = CODEBLOCK.purifyCode(code, {
            freezeToJSON: true,
            skipFrozenJSONVerify: true,
            on: {
                codeblock: function (codeblock) {

                    ASSERT.equal(codeblock instanceof CODEBLOCK.Codeblock, true);

                    blockNumber += 1;

                    if (blockNumber === 1) {
                        ASSERT.deepEqual(codeblock.toString(), {
                            ".@": "github.com~0ink~codeblock/codeblock:Codeblock",
                            "_code": "\\nreturn \"Hello World 1\";\\n",
                            "_format": "javascript",
                            "_args": [],
                            "_compiled": false
                        });

                        ASSERT.deepEqual(codeblock.getCode(), [
                            '',
                            'return "Hello World 1";',
                            ''
                        ].join("\n"));

                        codeblock.setCode(
                            codeblock.getCode().replace(/("Hello World 1)(")/, "$1!$2")
                        );

                    } else
                    if (blockNumber === 2) {
                        ASSERT.deepEqual(codeblock.toString(), {
                            ".@": "github.com~0ink~codeblock/codeblock:Codeblock",
                            "_code": "\\nHello World 2\\n",
                            "_format": "text:plain",
                            "_args": [],
                            "_compiled": false
                        });

                        ASSERT.deepEqual(codeblock.getCode(), [
                            '',
                            'Hello World 2',
                            ''
                        ].join("\n"));

                        codeblock.setCode(
                            codeblock.getCode().replace(/(Hello World 2)/, "$1!")
                        );
                    }

                    return codeblock;
                }
            }
        });
    });

    it('Verify', function() {

        purified = JSON.parse(purified);

        ASSERT.deepEqual(purified, {
            "block1": {
                ".@": "github.com~0ink~codeblock/codeblock:Codeblock",
                "_code": "\\nreturn \"Hello World 1!\";\\n",
                "_format": "javascript",
                "_args": [],
                "_compiled": false
            },
            "block2": {
                ".@": "github.com~0ink~codeblock/codeblock:Codeblock",
                "_code": "\\nHello World 2!\\n",
                "_format": "text:plain",
                "_args": [],
                "_compiled": false
            }
        });
    });

});

describe('Freeze to JavaScript', function() {

    var purified = null;

    it('Purify Code Sync', function() {

        var code = FS.readFileSync(PATH.join(__dirname, "rep.js"), "utf8");

        var blockNumber = 0;

        purified = CODEBLOCK.purifyCode(code, {
            freezeToJavaScript: true,
            on: {
                codeblock: function (codeblock) {

                    ASSERT.equal(codeblock instanceof CODEBLOCK.Codeblock, true);

                    blockNumber += 1;

                    if (blockNumber === 1) {
                        ASSERT.deepEqual(codeblock.toString(), {
                            ".@": "github.com~0ink~codeblock/codeblock:Codeblock",
                            "_code": "\\nreturn \"Hello World 1\";\\n",
                            "_format": "javascript",
                            "_args": [],
                            "_compiled": false
                        });

                        ASSERT.deepEqual(codeblock.getCode(), [
                            '',
                            'return "Hello World 1";',
                            ''
                        ].join("\n"));

                        codeblock.setCode(
                            codeblock.getCode().replace(/("Hello World 1)(")/, "$1!$2")
                        );

                    } else
                    if (blockNumber === 2) {
                        ASSERT.deepEqual(codeblock.toString(), {
                            ".@": "github.com~0ink~codeblock/codeblock:Codeblock",
                            "_code": "\\nHello World 2\\n",
                            "_format": "text:plain",
                            "_args": [],
                            "_compiled": false
                        });

                        ASSERT.deepEqual(codeblock.getCode(), [
                            '',
                            'Hello World 2',
                            ''
                        ].join("\n"));

                        codeblock.setCode(
                            codeblock.getCode().replace(/(Hello World 2)/, "$1!")
                        );
                    }

                    return codeblock;
                }
            }
        });
    });

    it('Verify', function() {

        ASSERT.deepEqual(purified.toString(), [
            '{',
            '    "block1": function () {',
            '',
            'return "Hello World 1!";',
            '',
            '},',
            '    "block2": {".@":"github.com~0ink~codeblock/codeblock:Codeblock","_code":"\\\\nHello World 2!\\\\n","_format":"text:plain","_args":[],"_compiled":false}',
            '}',
        ].join("\n"));
    });

});
    