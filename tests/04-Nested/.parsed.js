{
    "data": {
        "message": {
            "part1": "Hello",
            "part2": "World"
        },
        "chars": "`-=[]\\;',./~_+{}|:\"<>"
    },
    "main": {
        ".@": "github.com~0ink~codeblock/codeblock:Codeblock",
        "_code": "\nconst CODEBLOCK = require(\"../..\");\n\nconsole.log(\"%%%data.message.part1%%% %%%data.message.part2%%%\");\nconsole.log(JSON.stringify(data.message));\n\nvar impl = (___WrApCoDe___(\"javascript\", [\"data\"], \"\\nconsole.log('Sub:', '%%%data.message%%%');\\nconsole.log('Sub:', data.message);\\n\\nconsole.log('Sub:', '%%%data.chars%%%');\\nconsole.log('Sub:', \\\"%%%data.chars%%%\\\");\\nconsole.log('Sub:', data.chars);\\nconsole.log('Sub:', \\\"`-=[]\\;',./~_+{}|:\\\"<>\\\");\\nconsole.log('Sub:', '`-=[]\\;',./~_+{}|:\\\"<>');\\n\\nreturn {\\n    m1: data.message,\\n    c1: '%%%data.chars%%%',\\n    c2: \\\"%%%data.chars%%%\\\",\\n    c3: \\\"`-=[]\\;',./~_+{}|:\\\"<>\\\",\\n    c4: '`-=[]\\;',./~_+{}|:\\\"<>',\\n    c5: data.chars\\n};\", \"___WrApCoDe___END\"))\n\nconsole.log(\"impl\", impl);\n\nvar result = CODEBLOCK.run(impl, {\n    data: {\n        message: [\n            data.message.part1,\n            data.message.part2\n        ].join(\" \"),\n        chars: data.chars\n    }\n}, {\n    sandbox: {\n        console: console\n    }\n});\n\nconsole.log(\"result\", result);\n\nreturn result;",
        "_format": "javascript",
        "_args": [
            "data"
        ],
        "_compiled": false
    }
}