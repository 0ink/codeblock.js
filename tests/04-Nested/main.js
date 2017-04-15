
exports.TEST = {
    "data": {
        "message": {
            "part1": "Hello",
            "part2": "World"
        }
    },
    "main": function /*CodeBlock*/ (data) {

        const CODEBLOCK = require("../..");

        console.log("%%%data.message.part1%%% %%%data.message.part2%%%");
        console.log(JSON.stringify(data.message));

        var impl = function /*CodeBlock*/ (data) {

            console.log('Sub:', '%%%data.message%%%');
            console.log('Sub:', data.message);

            return data.message;
        }

        console.log("impl", impl);

        var result = CODEBLOCK.run(impl, {
            data: {
                message: [
                    data.message.part1,
                    data.message.part2
                ].join(" ")
            }
        }, {
            sandbox: {
                console: console
            }
        });

        console.log("result", result);

        return result;
    }
};
