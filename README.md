codeblock
=========

Adds **`codeblock` support to JavaScript**. A `codeblock` is **source code** of some kind,
wrapped in a syntax that specifies boundaries `lang (arg) >>>CODE<<<` and variables `%%arg%%` to be replaced.

**main.js**
```
exports.TEST = {
    "main": (javascript () >>>

        console.log("Hello World");

    <<<)
};
```

Such a `codeblock` is compiled for execution **at build time** or using a **require overlay**.

Install
-------

    npm install codeblock --save


API
---

For a list of all features see [tests/run.js](https://github.com/0ink/codeblock.js/blob/source/tests/run.js) and [tests/](https://github.com/0ink/codeblock.js/tree/source/tests).

```
const CODEBLOCK = require("../codeblock");

// Parse codeblocks in required modules
CODEBLOCK.patchGlobalRequire();

// Load JS Source using NodeJS 'require' overlay
const TEST = require(PATH.resolve("main.js")).TEST;

// Freeze from JS Object to JSON
var frozen = CODEBLOCK.freezeToJSON(TEST);

// That from JSON to JS Object again
var obj = CODEBLOCK.thawFromJSON(frozen);

// Re-Freeze from JS Object to JSON
var refrozen = CODEBLOCK.freezeToJSON(obj);

// Freeze from JS Object back to original JS Source
var source = CODEBLOCK.freezeToSource(obj);

// Prepare all codeblocks for running
var made = CODEBLOCK.makeAll(obj);

// Run all codeblocks (for use in NodeJS)
var result = CODEBLOCK.runAll(made);

```


Formats
=======

`codeblock` supports converting between the following **interchangeable** formats.

## Source

```
exports.TEST = {
    "data": {
        "message": "Hello World"
    },
    "main": (javascript (data) >>>

        console.log("%%%data.message%%%");
        console.log(data.message);

    <<<)
}
```

## Frozen

```
exports.TEST = {
    "data": {
        "message": "Hello World"
    },
    "main": "{\".@\":\"github.com~0ink~codeblock/codeblock:Codeblock\",\"_code\":\"console.log(\\\"%%%data.message%%%\\\");\\nconsole.log(data.message);\",\"_format\":\"javascript\",\"_args\":[\"data\"]}"
}
```

## JS Object

```
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
```

## Made

**NOTE:** The *made* format has all `%%%` delimited variables replaced and cannot be converted
back to the other formats due to this fact.

```
exports.TEST = {
    "data": {
        "message": "Hello World"
    },
    "main": {
        ".@": "github.com~0ink~codeblock/codeblock:Codeblock",
        "_code": "console.log(\"Hello World\");\nconsole.log(data.message);",
        "_format": "javascript",
        "_args": [
            "data"
        ]
    }
}
```


Provenance
==========

Original source logic under [MIT](https://opensource.org/licenses/MIT) by [Christoph Dorn](http://christophdorn.com/)
