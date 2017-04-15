
exports.TEST = {
    "data": {
        "message": "Hello World",
        "chars": "`-=[]\\;',./~_+{}|:\"<>"
    },
    "main": function /*CodeBlock*/ (data) {

        console.log(["%%%data.message%%%"].join("\n"));
        console.log(data.message);

        console.log("%%%data.chars%%%");
        console.log('%%%data.chars%%%');
        console.log(data.chars);

        return data.message;
    }
};
