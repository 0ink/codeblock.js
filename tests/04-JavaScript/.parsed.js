{
    "data": {
        "message": "Hello World",
        "chars": "`.`-=[]\\;',./~_+{}|:\"<>"
    },
    "main": {
        ".@": "github.com~0ink~codeblock/codeblock:Codeblock",
        "_code": "\\nconsole.log(\"m0\", [\"foo\", \"bar\"].join(\"\\\\n\"));\\n\\nconsole.log(\"m1\", [\"%%%data.message%%%\"].join(\"\\\\n\"));\\nconsole.log(\"m2\", [\"%%%data.message%%%\"].join(\"\\\\\\n\"));\\nconsole.log(\"m3\", data.message);\\n\\nconsole.log(\"m4\", \"%%%data.chars%%%\");\\nconsole.log(\"m5\", '%%%data.chars%%%');\\nconsole.log(\"m6\", data.chars);\\n\\nif (\"%%%data.chars%%%\" !== \"`.`-=[]\\\\;',./~_+{}|:\\\"<>\") {\\n    throw new Error(\"data.chars [1] mis-match\");\\n}\\n\\nif ('%%%data.chars%%%' !== \"`.`-=[]\\\\;',./~_+{}|:\\\"<>\") {\\n    throw new Error(\"data.chars [2] mis-match\");\\n}\\n\\nif (data.chars !== \"`.`-=[]\\\\;',./~_+{}|:\\\"<>\") {\\n    throw new Error(\"data.chars [3] mis-match\");\\n}\\n\\nreturn data.message;",
        "_format": "javascript",
        "_args": [
            "data"
        ],
        "_compiled": false
    }
}