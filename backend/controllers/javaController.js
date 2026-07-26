const { compileJava } = require("../services/javaCompiler");

const compileCode = (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Code is required"
            });
        }

        const result = compileJava(code);

        res.json(result);

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    compileCode
};