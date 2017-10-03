
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
    this._code = code;
    this._format = format;
    this._args = args;
    this._compiled = false;
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
    var codeblock = new Codeblock(doc._code, doc._format, doc._args);
    codeblock._compiled = doc._compiled;
    return codeblock;
}
Codeblock.prototype.getCode = function () {
    if (!this._compiled) {
        // TODO: Compile
    }
    return linesForEscapedNewline(this._code).join("\n");
}
