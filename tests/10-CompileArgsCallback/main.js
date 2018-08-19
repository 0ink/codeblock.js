#!/usr/bin/env bash.origin.test via github.com/mochajs/mocha

const FS = require("fs");
const ASSERT = require('assert');
const CODEBLOCK = require("../..");


describe('Compile Args Callback', function () {

    var doc = CODEBLOCK.purifyCode([
        'exports.doc = (markdown (header) >>>',
            '%%%["header"].title%%%',
            '===',
            '%%%["header"].text%%%',
        '<<<)'
    ].join("\n"));
    
    it('Iterative variable replacement', function () {

        var exports = {};
        eval(doc.toString());

        var codeblock = exports.doc();

        var markdown = codeblock.compile(function (key) {
            if (key === '["header"].title') {
                return 'Title';
            } else
            if (key === '["header"].text') {
                return 'This is text for %%%["header"].title%%%.';
            }
            throw new Error("no value for key '" + key + "'!");
        });

        ASSERT.deepEqual(markdown.getCode(), [
            'Title',
            '===',
            'This is text for Title.'
        ].join("\n"));
    });

    it('Singular variable replacement', function () {

        var exports = {};
        eval(doc.toString());

        var codeblock = exports.doc();

        var markdown = codeblock.compile(function (key) {
            if (key === '["header"].title') {
                return 'Title';
            } else
            if (key === '["header"].text') {
                var val = new String('This is text for %%%["header"].title%%%.');
                val.replaceVariables = false;
                return val;
            }
            throw new Error("no value for key '" + key + "'!");
        });

        ASSERT.deepEqual(markdown.getCode(), [
            'Title',
            '===',
            'This is text for %%%["header"].title%%%.'
        ].join("\n"));
    });    
});
