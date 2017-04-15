{
    "data": {
        "message": "Hello World",
        "chars": "`-=[]\\;',./~_+{}|:\"<>"
    },
    "main": {
        ".@": "github.com~0ink~codeblock/codeblock:Codeblock",
        "_code": "\nconsole.log([\"%%%data.message%%%\"].join(\"\\n\"));\nconsole.log(data.message);\n\nconsole.log(\"%%%data.chars%%%\");\nconsole.log('%%%data.chars%%%');\nconsole.log(data.chars);\n\nreturn data.message;",
        "_format": "javascript",
        "_args": [
            "data"
        ],
        "_compiled": false
    }
}