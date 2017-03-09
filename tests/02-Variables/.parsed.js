{
    "data": {
        "message": "Hello World",
        "prefix": "Announce:"
    },
    "main": {
        ".@": "github.com~0ink~codeblock/codeblock:Codeblock",
        "_code": "\nconsole.log(\"%%%data.prefix%%% %%%data.message%%%\");\nconsole.log(data.message);\n\nreturn data.message;",
        "_format": "javascript",
        "_args": [
            "data"
        ],
        "_compiled": false
    }
}