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

#        runTest "${__BO_DIR__}/01-Basic"
#        runTest "${__BO_DIR__}/03-JavaScript"
#        runTest "${__BO_DIR__}/04-Nested"
#exit 0

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
        # TODO: Use NodeJS to split output to log and stdout so we can stream to remote socket
        #       and preserve escape characters.
        BO_sourcePrototype "${__BO_DIR__}/run.sh" Run 2>&1 | tee "$runLogPath"

        # TODO: Write test result to $CIRCLE_TEST_REPORTS/tests.run.result.xml
        #<?xml version="1.0" encoding="UTF-8"?>
        #<testsuite>
        #  <!-- if your classname does not include a dot, the package defaults to "(root)" -->
        #  <testcase name="my testcase" classname="my package.my classname" time="29">
        #    <!-- If the test didn't pass, specify ONE of the following 3 cases -->
        #    <!-- option 1 --> <skipped />
        #    <!-- option 2 --> <failure message="my failure message">my stack trace</failure>
        #    <!-- option 3 --> <error message="my error message">my crash report</error>
        #    <system-out>my STDOUT dump</system-out>
        #    <system-err>my STDERR dump</system-err>
        #  </testcase>
        #</testsuite>

        # TODO: Get latest build artifacts and make available publickly
        #curl https://circleci.com/api/v1.1/me?circle-token=
        #curl https://circleci.com/api/v1.1/project/github/0ink/codeblock.js?circle-token=
        #curl https://circleci.com/api/v1.1/project/github/0ink/codeblock.js/latest/artifacts?circle-token=

    fi
}
init "$@"
