
exports.TEST = {
    "data": {
        "message": {
            "part1": "Hello",
            "part2": "World"
        },
        "chars": "`.`-=[]\\;',./~_+{}|:\"<>"
    },
    "main": function /*CodeBlock*/ (data) {

        const CODEBLOCK = require("../..");

        console.log("m1", "%%%data.message.part1%%% %%%data.message.part2%%%");
        console.log("m1", JSON.stringify(data.message));

        var impl = function /*CodeBlock*/ (data) {

            console.log('s1:', '%%%data.message%%%');
            console.log('s2:', data.message);

            console.log('s3:', '%%%data.chars%%%');
            console.log('s4:', "%%%data.chars%%%");
            console.log('s5:', data.chars);
            console.log('s6:', "`.`-=[]\\;',./~_+{}|:\"<>");
            console.log('s7:', '`.`-=[]\\;\',./~_+{}|:"<>');

            if ("%%%data.chars%%%" !== "`.`-=[]\\;',./~_+{}|:\"<>") {
                throw new Error("data.chars [1] mis-match");
            }

            if ('%%%data.chars%%%' !== "`.`-=[]\\;',./~_+{}|:\"<>") {
                throw new Error("data.chars [2] mis-match");
            }

            if (data.chars !== "`.`-=[]\\;',./~_+{}|:\"<>") {
                throw new Error("data.chars [3] mis-match");
            }

            return {
                m1: data.message,
                c1: '%%%data.chars%%%',
                c2: "%%%data.chars%%%",
                c3: "`.`-=[]\\;',./~_+{}|:\"<>",
                c4: '`.`-=[]\\;\',./~_+{}|:"<>',
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
