((function (_require, _exports, _module) {
var bundle = { require: _require, exports: _exports, module: _module };
var exports = undefined;
var module = undefined;
var define = function (deps, init) {
var exports = init();
[["Codeblock","Codeblock"]].forEach(function (expose) {
if (typeof window !== "undefined") {
window[expose[0]] = exports[expose[1]];
} else if (typeof self !== "undefined") {
self[expose[0]] = exports[expose[1]];
}
});
}; define.amd = true;

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.mainModule = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var REGEXP_ESCAPE = function REGEXP_ESCAPE(str) {
  return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
};

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
  if (_typeof(code) === "object" && code.hasOwnProperty("raw") && Object.keys(code).length === 1) {
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
  var re = /(?:^|\n)(.*?)(["']?)(%%%([^%]+)%%%)(["']?)/;
  var match = null;

  while (true) {
    match = code.match(re);
    if (!match) break;
    var varParts = match[4].split(".");
    var val = variables;

    while (varParts.length > 0) {
      val = val[varParts.shift()];

      if (typeof val === "undefined") {
        console.error("variables", variables);
        throw new Error("Variable '" + match[4] + "' not found while processing code section!");
      }
    }

    val = val.toString().split("\n").map(function (line, i) {
      if (i > 0) {
        line = match[1] + line;
      }

      return line;
    }).join("\n");
    var searchString = match[3];

    if (match[2] === "'" && match[5] === "'") {
      val = "'" + val.replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
      searchString = "'" + searchString + "'";
    } else if (match[2] === '"' && match[5] === '"') {
      val = '"' + val.replace(/\\/g, "\\\\").replace(/"/g, "\\\"") + '"';
      searchString = '"' + searchString + '"';
    }

    code = code.replace(new RegExp(REGEXP_ESCAPE(searchString), "g"), val);
  }

  var codeblock = new Codeblock(code, this._format, this._args);
  codeblock._compiled = true;
  return codeblock;
};

Codeblock.prototype.getCode = function () {
  return linesForEscapedNewline(this._code).join("\n");
};
},{}]},{},[1])(1)
});

})((typeof require !== "undefined" && require) || undefined, (typeof exports !== "undefined" && exports) || undefined, (typeof module !== "undefined" && module) || undefined))