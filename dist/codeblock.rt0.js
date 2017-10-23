((function () {
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.mainModule = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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
    if ((typeof code === "undefined" ? "undefined" : _typeof(code)) === "object" && code.hasOwnProperty("raw") && Object.keys(code).length === 1) {
        this._code = code.raw;
    } else {
        if (code) {
            this.setCode(code);
        } else {
            this._code = "";
        }
    }
    this._format = format;
    this._args = args;
    this._compiled = false;
};
Codeblock.prototype.setCode = function (code) {
    this._code = ("" + code).replace(/\\n/g, "___NeWlInE_KeEp_OrIgInAl___").replace(/\n/g, "\\n").replace(/(___NeWlInE_KeEp_OrIgInAl___)/g, "\\$1");
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
    var codeblock = new Codeblock({
        raw: doc._code
    }, doc._format, doc._args);
    codeblock._compiled = doc._compiled;
    return codeblock;
};
Codeblock.prototype.compile = function (variables) {
    variables = variables || {};
    var code = this.getCode();

    console.log("COMPILE", code, "with variables", variables);

    var codeblock = new Codeblock(code, this._format, this._args);
    codeblock._compiled = true;
    return codeblock;
};
Codeblock.prototype.getCode = function () {
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