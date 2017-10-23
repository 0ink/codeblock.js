
function linesForEscapedNewline (rawCode) {
    var lines = [];
    var segments = rawCode.split(/([\\]*\\n)/);
    for (var i=0; i<segments.length ; i++) {
        if (i % 2 === 0) {
            lines.push(segments[i]);
        } else
        if (segments[i] !== "\\n") {
            lines[lines.length - 1] += segments[i].replace(/\\\\/g, "\\") + segments[i + 1];
            i++;
        }
    }
    lines = lines.map(function (line) {
        return line.replace(/\\\n/g, "\\n");        
    });
    return lines;
}

const Codeblock = exports.Codeblock = function (code, format, args) {
    if (
        typeof code === "object" &&
        code.hasOwnProperty("raw") &&
        Object.keys(code).length === 1
    ) {
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
}
Codeblock.prototype.setCode = function (code) {
    this._code = ("" + code).replace(/\\n/g, "___NeWlInE_KeEp_OrIgInAl___")
        .replace(/\n/g, "\\n")
        .replace(/(___NeWlInE_KeEp_OrIgInAl___)/g, "\\$1");
}
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
}
Codeblock.prototype.compile = function (variables) {
    variables = variables || {};
    var code = this.getCode();

console.log("COMPILE", code, "with variables", variables);

    var codeblock = new Codeblock(code, this._format, this._args);
    codeblock._compiled = true;
    return codeblock;
}
Codeblock.prototype.getCode = function () {
    return linesForEscapedNewline(this._code).join("\n");
}
