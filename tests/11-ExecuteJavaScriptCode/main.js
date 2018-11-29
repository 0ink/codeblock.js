#!/usr/bin/env bash.origin.test via github.com/mochajs/mocha

const ASSERT = require('assert');
const CODEBLOCK = require("../..");


describe('Execute JavaScript Code', function () {

    it('return', function () {

        const codeblock = new CODEBLOCK.Codeblock(`return ["Greeting:", greeting].join(' ');`, 'javascript', ['greeting']);

        const result = codeblock.run({
            greeting: 'Hello World'
        });

        ASSERT.equal(result, 'Greeting: Hello World');
    });

    it('exports', function () {

        const exports = {}
        const env = {
            greeting: 'Hello World',
            exports: exports
        }
        const codeblock = new CODEBLOCK.Codeblock(`
            exports.getGreeting = function () {
                return ["Greeting:", greeting].join(' ');
            }
        `, 'javascript', Object.keys(env));
        codeblock.run(env);

        ASSERT.equal(exports.getGreeting(), 'Greeting: Hello World');
    });

});
