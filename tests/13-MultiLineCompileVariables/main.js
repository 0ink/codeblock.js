#!/usr/bin/env bash.origin.test via github.com/mochajs/mocha

const FS = require("fs");
const ASSERT = require('assert');
const CODEBLOCK = require("../../codeblock");

describe('Multi-line Compile Variables', function () {

    it('Compile', function () {

        let codeblocks = CODEBLOCK.purifyCode(`{
            "block1": (inf (config) >>>
                {
                    "config": %%%config.oneline%%%
                }
            <<<),
            "block2": (text (config) >>>
                PRE
                    %%%config.multiline%%%
                POST
            <<<),
            "block3": (inf (config) >>>
                {
                    "config": %%%config.multiline%%%
                }
            <<<)
        }`, {
            freezeToJSON: true
        });

        codeblocks = CODEBLOCK.thawFromJSON(JSON.parse(codeblocks));

        codeblocks.block1 = codeblocks.block1.compile({
            config: {
                oneline: JSON.stringify({
                    "foo": "bar",
                    "baz": "zop"
                })
            }
        });
        codeblocks.block2 = codeblocks.block2.compile({
            config: {
                multiline: JSON.stringify({
                    "foo": "bar",
                    "baz": "zop"
                }, null, 4)
            }
        });
        codeblocks.block3 = codeblocks.block3.compile({
            config: {
                multiline: JSON.stringify({
                    "foo": "bar",
                    "baz": "zop"
                }, null, 4)
            }
        });

        console.log("BLOCK1:", codeblocks.block1.getCode());        
        ASSERT.equal(codeblocks.block1.getCode(), [
            '{',
            '    "config": {"foo":"bar","baz":"zop"}',
            '}'
        ].join("\n"));

        console.log("BLOCK2:", codeblocks.block2.getCode());
        ASSERT.equal(codeblocks.block2.getCode(), [
            'PRE',
            '    {',
            '        "foo": "bar",',
            '        "baz": "zop"',
            '    }',
            'POST'
        ].join("\n"));

        console.log("BLOCK3:", codeblocks.block3.getCode());
        ASSERT.equal(codeblocks.block3.getCode(), [
            '{',
            '    "config": {',
            '                  "foo": "bar",',
            '                  "baz": "zop"',
            '              }',
            '}',
        ].join("\n"));
    });

});
