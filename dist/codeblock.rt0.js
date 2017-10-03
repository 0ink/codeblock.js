((function () {
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.mainModule = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

function linesForEscapedNewline(rawCode) {
    var lines = [];
    var segments = rawCode.split(/([\\]*\\n)/);
    for (var i = 0; i < segments.length; i++) {
        if (i % 2 === 0) {
            lines.push(segments[i]);
        } else if (segments[i] !== "\\n") {
            lines[lines.length - 1] += segments[i].replace(/\\\\/g, "\\") + segments[i + 1];
            i++;
        }
    }
    lines = lines.map(function (line) {
        return line.replace(/\\\n/g, "\\n");
    });
    return lines;
}

var Codeblock = exports.Codeblock = function (code, format, args) {
    this._code = code;
    this._format = format;
    this._args = args;
    this._compiled = false;
};
Codeblock.FromJSON = function (doc) {
    if (typeof doc === "string") {
        try {
            doc = JSON.parse(doc);
        } catch (err) {
            console.error("doc", doc);
            throw new Error("Error parsing JSON!");
        }
    }
    if (doc[".@"] !== "github.com~0ink~codeblock/codeblock:Codeblock") {
        throw new Error("JSON is not a frozen codeblock!");
    }
    var codeblock = new Codeblock(doc._code, doc._format, doc._args);
    codeblock._compiled = doc._compiled;
    return codeblock;
};
Codeblock.prototype.getCode = function () {
    if (!this._compiled) {
        // TODO: Compile
    }
    return linesForEscapedNewline(this._code).join("\n");
};

},{}]},{},[1])(1)
});
var mainModule = window.mainModule;
delete window.mainModule;
["Codeblock"].forEach(function (name) {
window[name] = mainModule[name];
});
})())