const compileJava = require("../java_hub/compileJava");

exports.compileJavaCode = (req, res) => {
    const { code } = req.body;

    if (!code || typeof code !== "string" || !code.trim()) {
        return res.status(400).json({
            success: false,
            output: "",
            tokens: [],
            errors: [{ line: 1, column: 1, message: "Source code is required!" }]
        });
    }

    try {
        const result = compileJava(code);

        if (result && result.success) {
            return res.status(200).json({
                success: true,
                output: result.output ?? "", // real output; "" is a valid result
                tokens: result.tokens || [],
                errors: [],
                assembly: result.targetCode || ""
            });
        }

        return res.status(400).json({
            success: false,
            output: "",
            tokens: result?.tokens || [],
            errors: [{ line: 1, column: 1, message: result?.error || "Compilation failed" }]
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            output: "",
            tokens: [],
            errors: [{ line: 1, column: 1, message: err.message }]
        });
    }
};