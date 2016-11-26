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

                if [ ! -z "${CIRCLE_ARTIFACTS}" ]; then
                    node "${__BO_DIR__}/run.js" | tee "${CIRCLE_ARTIFACTS}/test.bash.log"
                else
                    node "${__BO_DIR__}/run.js"
                fi

            popd > /dev/null
            BO_format "$VERBOSE" "FOOTER"
        }

        for testPath in ${__BO_DIR__}/*/ ; do
            runTest "${testPath}"
        done

        BO_format "${VERBOSE}" "FOOTER"
    }

    Run "$@"
}
init "$@"
