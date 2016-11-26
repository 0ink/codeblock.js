
exports.TEST = {
    "data": {
        "message": "Hello World"
    },
    "main": (javascript (data) >>>

        console.log("%%%data.message%%%");
        console.log(data.message);

    <<<)
};
