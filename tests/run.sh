#!/bin/bash -e
# Source https://github.com/bash-origin/bash.origin
if [ -z "${BO_LOADED}" ]; then
    if [ -e "node_modules/bash.origin/bash.origin" ]; then
        . "node_modules/bash.origin/bash.origin"
    else
        . "${HOME}/.bash.origin"
    fi
fi
function init {
    eval BO_SELF_BASH_SOURCE="$BO_READ_SELF_BASH_SOURCE"
    BO_deriveSelfDir ___TMP___ "$BO_SELF_BASH_SOURCE"
    local __BO_DIR__="${___TMP___}"

    function Run {
        BO_format "${VERBOSE}" "HEADER" "Run Tests"

        BO_ensure_node

        function runTest {
            BO_format "$VERBOSE" "HEADER" "Run test: ${1}"
            pushd "${1}" > /dev/null

                BO_log "1" "Run: ${1}"

                node "${__BO_DIR__}/run.js"

            popd > /dev/null
            BO_format "$VERBOSE" "FOOTER"
        }

        for testPath in ${__BO_DIR__}/*/ ; do
            runTest "${testPath}"
        done

        echo "OK"

        BO_format "${VERBOSE}" "FOOTER"
    }


    if [ "${1}" == "Run" ]; then
        Run "$@"
    else
        local runLogPath
        if [ ! -z "${CIRCLE_ARTIFACTS}" ]; then
            runLogPath="${CIRCLE_ARTIFACTS}/tests.run.bash.log"
        else
            runLogPath="tests/.run.bash.log"
        fi
        BO_sourcePrototype "${__BO_DIR__}/run.sh" Run 2>&1 | tee "$runLogPath"
    fi
}
init "$@"
