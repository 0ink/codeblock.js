
exports.TEST = {
    "data": {
        "message": {
            "part1": "Hello",
            "part2": "World"
        },
        "chars": "`-=[]\\;',./~_+{}|:\"<>"
    },
    "main": function /*CodeBlock*/ (data) {

        const CODEBLOCK = require("../..");

        console.log("%%%data.message.part1%%% %%%data.message.part2%%%");
        console.log(JSON.stringify(data.message));

        var impl = function /*CodeBlock*/ (data) {

            console.log('Sub:', '%%%data.message%%%');
            console.log('Sub:', data.message);

            console.log('Sub:', '%%%data.chars%%%');
            console.log('Sub:', "%%%data.chars%%%");
            console.log('Sub:', data.chars);
            console.log('Sub:', "`-=[]\\;',./~_+{}|:\"<>");
            console.log('Sub:', '`-=[]\\;\',./~_+{}|:"<>');

            return {
                m1: data.message,
                c1: '%%%data.chars%%%',
                c2: "%%%data.chars%%%",
                c3: "`-=[]\\;',./~_+{}|:\"<>",
                c4: '`-=[]\\;\',./~_+{}|:"<>',
                c5: data.chars
            };
        }

        console.log("impl", impl);

        var result = CODEBLOCK.run(impl, {
            data: {
                message: [
                    data.message.part1,
                    data.message.part2
                ].join(" "),
                chars: data.chars
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
