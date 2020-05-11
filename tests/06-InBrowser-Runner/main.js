#!/usr/bin/env bash.origin.test via github.com/nightwatchjs/nightwatch
/*
module.config = {
    "browsers": [
        "chrome"
    ],
    "test_runner": "mocha"
}
*/

console.log(">>>TEST_IGNORE_LINE:^[\\d\\.]+\\s<<<");

const LIB = require('bash.origin.lib').js;

describe("Suite", function() {

    const server = LIB.BASH_ORIGIN_EXPRESS.runForTestHooks(before, after, {
        "routes": {
            "/": function /* CodeBlock */ () {

                const CODEBLOCK = require("../..");

                var codeblock = new CODEBLOCK.Codeblock("Hello World!", "text");

                return function (req, res, next) {

                    res.writeHead(200, {
                        "Content-Type": "text/html"
                    });
                    res.end([
                        "<body></body>",
                        '<script src="/dist/codeblock.rt0.js"></script>',
                        "<script>",
                        'var block = Codeblock.FromJSON(' + JSON.stringify(codeblock.toString(), null, 4) + ');',
                        'window.document.body.innerHTML = block.getCode();',
                        "</script>"
                    ].join("\n"));
                };
            },
            "/dist/codeblock.rt0.js": {
                "gi0.PINF.it/build/v0 # /dist # /codeblock.rt0.js": {
                    "@it.pinf.org.browserify # router/v1": {
                        "src": __dirname + "/../../codeblock.rt0.js",
                        "expose": {
                            "window": "Codeblock"
                        }
                    }
                }
            }
        }
    });

    it('Test', async function (client) {

        const PORT = (await server).config.port;

        // Run as page
        client.url('http://localhost:' + PORT + '/').pause(500);
        client.waitForElementPresent('BODY', 3000);        
        client.expect.element('BODY').text.to.contain([
            'Hello World!'
        ].join(""));

        if (process.env.BO_TEST_FLAG_DEV) client.pause(60 * 60 * 24 * 1000);
    });
});
