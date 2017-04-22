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
        "_code": "\\nconst CODEBLOCK = require(\"../..\");\\n\\nconsole.log(\"m1\", \"%%%data.message.part1%%% %%%data.message.part2%%%\");\\nconsole.log(\"m1\", JSON.stringify(data.message));\\n\\nvar impl = (___WrApCoDe___(\"javascript\", [\"data\"], \"\\\\nconsole.log('s1:', '%%%data.message%%%');\\\\nconsole.log('s2:', data.message);\\\\n\\\\nconsole.log('s3:', '%%%data.chars%%%');\\\\nconsole.log('s4:', \\\"%%%data.chars%%%\\\");\\\\nconsole.log('s5:', data.chars);\\\\nconsole.log('s6:', \\\"`-=[]\\\\\\\\;',./~_+{}|:\\\\\\\"<>\\\");\\\\nconsole.log('s7:', '`-=[]\\\\\\\\;\\\\',./~_+{}|:\\\"<>');\\\\n\\\\nif (\\\"%%%data.chars%%%\\\" !== \\\"`-=[]\\\\\\\\;',./~_+{}|:\\\\\\\"<>\\\") {\\\\n    throw new Error(\\\"data.chars [1] mis-match\\\");\\\\n}\\\\n\\\\nif ('%%%data.chars%%%' !== \\\"`-=[]\\\\\\\\;',./~_+{}|:\\\\\\\"<>\\\") {\\\\n    throw new Error(\\\"data.chars [2] mis-match\\\");\\\\n}\\\\n\\\\nif (data.chars !== \\\"`-=[]\\\\\\\\;',./~_+{}|:\\\\\\\"<>\\\") {\\\\n    throw new Error(\\\"data.chars [3] mis-match\\\");\\\\n}\\\\n\\\\nreturn {\\\\n    m1: data.message,\\\\n    c1: '%%%data.chars%%%',\\\\n    c2: \\\"%%%data.chars%%%\\\",\\\\n    c3: \\\"`-=[]\\\\\\\\;',./~_+{}|:\\\\\\\"<>\\\",\\\\n    c4: '`-=[]\\\\\\\\;\\\\',./~_+{}|:\\\"<>',\\\\n    c5: data.chars\\\\n};\", \"___WrApCoDe___END\"))\\n\\nconsole.log(\"impl\", impl);\\n\\nvar result = CODEBLOCK.run(impl, {\\n    data: {\\n        message: [\\n            data.message.part1,\\n            data.message.part2\\n        ].join(\" \"),\\n        chars: data.chars\\n    }\\n}, {\\n    sandbox: {\\n        console: console\\n    }\\n});\\n\\nconsole.log(\"result\", result);\\n\\nreturn result;",
        "_format": "javascript",
        "_args": [
            "data"
        ],
        "_compiled": false
    }
}