#!/usr/bin/env bash.origin.test via github.com/mochajs/mocha

const FS = require("fs");
const ASSERT = require('assert');
const CODEBLOCK_BROWSER = require("../../codeblock.browser");

describe('InBrowser Editor', function () {

    const serialized = {
        "main": {
            ".@": "github.com~0ink~codeblock/codeblock:Codeblock",
            "_code": "\\nconsole.log(\"%%%data.message%%%\");\\nconsole.log(data.message);\\n\\nreturn data.message;",
            "_format": "javascript",
            "_args": [
                "data"
            ],
            "_compiled": false
        }
    };

    let source = null;

    it('Serialized to Source', function () {

        source = CODEBLOCK_BROWSER.freezeToSource(serialized);

        ASSERT.equal(source, `{
    "main": (javascript (data) >>>
        
        console.log("%%%data.message%%%");
        console.log(data.message);
        
        return data.message;
    <<<)
}`);

    });

    it('Source to Serialized', function () {

        let frozen = CODEBLOCK_BROWSER.purifyCode(source, {
            freezeToJSON: true
        });

        ASSERT.deepEqual(JSON.parse(frozen.toString()), serialized);
    });

});
