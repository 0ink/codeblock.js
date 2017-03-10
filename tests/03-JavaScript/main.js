
exports.TEST = {
    "data": {
        "message": "Hello World"
    },
    "main": function /*CodeBlock*/ (data) {

        console.log(["%%%data.message%%%"].join("\n"));
        console.log(data.message);

        return data.message;
    }
};
