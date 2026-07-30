const { runCompiler } = require("../services/compilerC");

function compile(req, res) {

    try {

        const { code } = req.body;

        if (!code || !code.trim()) {

            return res.status(400).json({
                success: false,
                message: "Source code is required."
            });

        }

        const result = runCompiler(code);

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