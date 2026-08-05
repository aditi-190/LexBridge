const { runCompiler } = require("../services/compilerC");

function compile(req, res) {

    try {

        const { code ,input} = req.body;

console.log("Controller input =", input);

const result = runCompiler(code, input);
        if (!code || !code.trim()) {

            return res.status(400).json({
                success: false,
                message: "Source code is required."
            });

        }

        const result =
    runCompiler(
        code,
        req.body.input || []
    );

        return res.json(result);

    } catch (err) {

        console.error("C Compiler Error:", err);

        return res.status(500).json({
            success: false,
            message: "Compiler error",
            error: err.message
        });

    }

}

module.exports = {
    compile
};