#!/usr/bin/env bash.origin.script

function EXPORTS_run_json {

    BO_run_node --eval '
        const CODEBLOCK = require("$__DIRNAME__/codeblock");

        if (process.env.DEBUG) {
            console.error("[codeblock:run_json] source >>>");
            process.stderr.write(process.argv[1] + "\n");
            console.error("<<< [codeblock:run_json]");
        }

        var obj = CODEBLOCK.thawFromJSON(process.argv[1]);

        if (process.env.DEBUG) {
            console.error("[codeblock:run_json] thawed >>>");
            console.error(obj);
            console.error("<<< [codeblock:run_json]");
        }

        var result = CODEBLOCK.runAll(obj, {
            sandbox: {
                CODEBLOCK: CODEBLOCK,
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
