#!/bin/bash -e
# Source https://github.com/bash-origin/bash.origin
if [ -z "${BO_LOADED}" ]; then
    . "${HOME}/.bash.origin"
fi
function init {
    eval BO_SELF_BASH_SOURCE="$BO_READ_SELF_BASH_SOURCE"
    BO_deriveSelfDir ___TMP___ "$BO_SELF_BASH_SOURCE"
    local __BO_DIR__="${___TMP___}"

    function Run {
        BO_format "${VERBOSE}" "HEADER" "Run Tests"

        function runTest {
            BO_format "$VERBOSE" "HEADER" "Run test: ${1}"
            pushd "${1}" > /dev/null

            node --eval '
                const CODEBLOCK = require("'${__BO_DIR__}'/../codeblock");
                CODEBLOCK.patchGlobalRequire();

                const ASSERT = require("assert");
                const FS = require("fs");
                function log () {
                    if (!process.env.VERBOSE) return;
                    console.log.apply(console, arguments);
                }

                const TEST = require("./main").TEST;


                var frozen = CODEBLOCK.freezeToJSON(TEST);
                log("frozen", JSON.stringify(JSON.parse(frozen), null, 4));

                // TODO: Validate frozen

                var obj = CODEBLOCK.thawFromJSON(frozen);
                log("obj", JSON.stringify(obj, null, 4));

                // TODO: Validate obj

                var refrozen = CODEBLOCK.freezeToJSON(obj);
                log("refrozen", JSON.stringify(JSON.parse(refrozen), null, 4));

                ASSERT.deepEqual(refrozen, frozen);


                var source = CODEBLOCK.freezeToSource(obj);
                source = [
                    "",
                    "exports" + ".TEST = " + source.split("\n").map(function (line) {
                        if (/^[\s\t]+$/.test(line)) {
                            line = "";
                        }
                        return line;
                    }).join("\n") + ";",
                    ""
                ].join("\n")
                log("source", source);

                ASSERT.equal(source, FS.readFileSync("main.js", "utf8"));


                var result = CODEBLOCK.makeAll(obj, obj.data);
                log("result", JSON.stringify(result, null, 4));

                // TODO: Validate result
            '

            popd > /dev/null
            BO_format "$VERBOSE" "FOOTER"
        }

        for testPath in ${__BO_DIR__}/*/main.* ; do
            runTest "$(dirname ${testPath})"
        done

        BO_format "${VERBOSE}" "FOOTER"
    }

    Run "$@"
}
init "$@"
