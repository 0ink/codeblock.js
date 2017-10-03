
exports.TEST = {
    "data": {
        "message": "Hello World",
        "prefix": [
            "Announce:"
        ]
    },
    "main": (javascript (data) >>>

        console.log("%%%data.prefix%%% %%%data.message%%%");
        console.log(data.message);

        return data.message;
    <<<)
};
