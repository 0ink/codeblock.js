
exports.TEST = {
    "data": {
        "message": "Hello World",
        "chars": "`-=[]\\;',./~_+{}|:\"<>"
    },
    "main": function /*CodeBlock*/ (data) {

        console.log("m1", ["%%%data.message%%%"].join("\n"));
        console.log("m2", ["%%%data.message%%%"].join("\\n"));
        console.log("m3", data.message);

        console.log("m4", "%%%data.chars%%%");
        console.log("m5", '%%%data.chars%%%');
        console.log("m6", data.chars);

        if ("%%%data.chars%%%" !== "`-=[]\\;',./~_+{}|:\"<>") {
            throw new Error("data.chars [1] mis-match");
        }

        if ('%%%data.chars%%%' !== "`-=[]\\;',./~_+{}|:\"<>") {
            throw new Error("data.chars [2] mis-match");
        }

        if (data.chars !== "`-=[]\\;',./~_+{}|:\"<>") {
            throw new Error("data.chars [3] mis-match");
        }

        return data.message;
    }
};
