#!/usr/bin/env bash.origin.test via github.com/mochajs/mocha

const FS = require("fs");
const ASSERT = require('assert');
const CODEBLOCK = require("../../codeblock");

describe('Variable Replacement', function () {

    it('Source to Serialized (with $)', function () {

        let frozen = CODEBLOCK.purifyCode(`{
    "main": (javascript (data) >>>

        return {
            "foo": [
                'bar',
                '$',
                '\\$'
            ]
        };
    <<<)
}`, {
            freezeToJSON: true
        });

        ASSERT.deepEqual(JSON.parse(frozen.toString()), {
            main: {
                '.@': 'github.com~0ink~codeblock/codeblock:Codeblock',
                _code: `\\nreturn {\\n    "foo": [\\n        'bar',\\n        '$',\\n        '\\$'\\n    ]\\n};`,
                _format: 'javascript',
                _args: [ 'data' ],
                _compiled: false
            }
        });
    });

});
