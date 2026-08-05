const fs = require("fs");
const path = require("path");

const { compileCpp } = require("./compileCpp");

function executeCpp(filePath = null) {

    let sourceCode = "";

    try {

        if (filePath) {

            sourceCode = fs.readFileSync(
                filePath,
                "utf8"
            );

        } else {

            sourceCode = fs.readFileSync(
                path.join(__dirname, "temp", "input.cpp"),
                "utf8"
            );

        }

        const result = compileCpp(sourceCode);

        return result;

    } catch (error) {

        return {

            success: false,

            phase: "Executor",

            error: error.message,

            output: ""

        };

    }

}

// Run directly
if (require.main === module) {

    const result = executeCpp();

    console.log(
        JSON.stringify(
            result,
            null,
            2
        )
    );

}

module.exports = {

    executeCpp

};