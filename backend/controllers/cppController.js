const { runCppCompiler } = require("../services/compilerCpp");

function run(req, res) {

    try {

        const { code, input } = req.body;
        // Debug
        console.log("Received Code:");
        console.log(code);

        console.log("Received Input:");
        console.log(input);

        if (!code || !code.trim()) {

            return res.status(400).json({

                success: false,

                message: "Source code is required."

            });

        }

        const result = runCppCompiler(code, input);

        return res.json(result);

    }

    catch (err) {

        console.error("C++ Compiler Error:", err);

        return res.status(500).json({

            success: false,

            message: "Compiler Error",

            error: err.message

        });

    }

}

module.exports = {

    run

};