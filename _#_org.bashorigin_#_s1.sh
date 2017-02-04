#!/usr/bin/env bash.origin.script

function EXPORTS_run_json {

    BO_run_node --eval '
        const CODEBLOCK = require("$__DIRNAME__/codeblock");

        var obj = CODEBLOCK.thawFromJSON(process.argv[1]);

        var result = CODEBLOCK.runAll(obj, {
            sandbox: {
                console: {
                    log: function () {
                        var args = Array.prototype.slice.call(arguments);
                        args.unshift("[codeblock]");
                        console.log.apply(console, args);
                    }
                }
            }
        });

        process.stdout.write(JSON.stringify(result));
    ' "$1"
}
