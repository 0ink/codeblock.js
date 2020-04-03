codeblock.js
============

[![CircleCI](https://circleci.com/gh/0ink/codeblock.js.svg?style=svg)](https://circleci.com/gh/0ink/codeblock.js)

Adds **Code Block support to JavaScript**. A `codeblock` is **source code** of some kind,
wrapped in a syntax that specifies boundaries `(LANGUAGE (ARG) >>>CODE<<<)` and variables `%%%ARG%%%` to be replaced.

**main.js**
````js
exports.TEST = {
    "main": (javascript () >>>

        console.log("Hello World");

    <<<)
};
````

Such a `codeblock` is compiled for execution **at build time** or using a **require overlay** in NodeJS.

Install
-------

    npm install codeblock
    node_modules/.bin/lib.json from node_modules > .~lib.json

API
---

For a list of all features see [tests/run.js](https://github.com/0ink/codeblock.js/blob/master/tests/run.js) and [tests/](https://github.com/0ink/codeblock.js/tree/master/tests).

````js
const CODEBLOCK = require("codeblock");

// Parse codeblocks in required JavaScript modules
CODEBLOCK.patchGlobalRequire();

// Load JavaScript Source using NodeJS 'require' overlay
const TEST = require("main.js").TEST;

// Freeze from JavaScript Object to JSON
var frozen = CODEBLOCK.freezeToJSON(TEST);

// Thaw from JSON to JavaScript Object again
var obj = CODEBLOCK.thawFromJSON(frozen);

// Re-Freeze from JavaScript Object to JSON
var refrozen = CODEBLOCK.freezeToJSON(obj);

// Freeze from JavaScript Object back to original JavaScript Source
var source = CODEBLOCK.freezeToSource(obj);

// Compile all codeblocks for running
var compiled = CODEBLOCK.compileAll(obj);

// Run all codeblocks (for use in NodeJS)
var result = CODEBLOCK.runAll(made);

````


Source Formats
==============

`codeblock` supports converting between the following **interchangeable** source formats.

## JavaScript/JSON Source

````js
exports.TEST = {
    "data": {
        "message": "Hello World"
    },
    "main": (javascript (data) >>>

        console.log("%%%data.message%%%");
        console.log(data.message);

        return data.message;
    <<<)
}
````

## JavaScript/JSON Serialized

````js
exports.TEST = {
    "data": {
        "message": "Hello World"
    },
    "main": {
        ".@": "github.com~0ink~codeblock/codeblock:Codeblock",
        "_code": "\nconsole.log(\"%%%data.message%%%\");\nconsole.log(data.message);\n\nreturn data.message;",
        "_format": "javascript",
        "_args": [
            "data"
        ],
        "_compiled": false
    }
}
````

## JavaScript Instanciated

````js
exports.TEST = {
    data: {
        message: 'Hello World'
    },
    main: {
        [Function: WrappedCodeblock]
        [length]: 1,
        [name]: 'WrappedCodeblock',
        [arguments]: null,
        [caller]: null,
        [prototype]: WrappedCodeblock {
            [constructor]: [Circular]
        }     
    }
}
````

Target Formats
==============

**NOTE:** The target formats cannot be converted back to their original source formats
as information is typically lost in the process of converting from source to target.

## Compiled

All `%%%` delimited variables are replaced with variables passed in as argument.

````js
exports.TEST = {
    "data": {
        "message": "Hello World"
    },
    "main": {
        ".@": "github.com~0ink~codeblock/codeblock:Codeblock",
        "_code": "\nconsole.log(\"Hello World\");\nconsole.log(data.message);\n\nreturn data.message;",
        "_format": "javascript",
        "_args": [
            "data"
        ],
        "_compiled": true
    }
}
````

## Executed

The `codeblock` is run using an interpreter and the result replaces the
original `codeblock`.

````js
exports.TEST = {
    "data": {
        "message": "Hello World"
    },
    "main": "Hello World"
}
````

Provenance
==========

Original source logic under [MIT License](https://opensource.org/licenses/MIT) by [Christoph Dorn](http://christophdorn.com/).
