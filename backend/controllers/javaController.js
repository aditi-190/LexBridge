const compileJava = require("../java_hub/compileJava");

exports.compileJavaCode = (req, res) => {
    const { code } = req.body;

    if (!code || typeof code !== "string" || !code.trim()) {
        return res.status(400).json({
            success: false,
            message: "Source code is required!"
        });
    }

    console.log('Received compile request');
    let result;
    try {
        result = compileJava(code);
        console.log('compileJava returned:', result && result.success ? 'success' : 'failure', result && result.error ? result.error : '');
    } catch (err) {
        console.error('Controller caught error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }

    if (result && result.success) {
        return res.status(200).json({
            success: true,
            message: "Compilation successful",
            output: result.targetCode || "",
            tokens: result.tokens || [],
            ast: result.ast || null,
            symbolTable: result.semantic?.symbolTable || null,
            semanticErrors: result.semantic?.errors || [],
            tac: result.tac || [],
            optimizedTac: result.optimizedTac || [],
            targetCode: result.targetCode || ""
        });
    }

    const errors = Array.isArray(result?.semantic?.errors) && result.semantic.errors.length > 0
        ? result.semantic.errors
        : result?.error
            ? [result.error]
            : ["Compilation failed"];

    return res.status(400).json({
        success: false,
        message: "Compilation failed",
        output: result.targetCode || "",
        tokens: result.tokens || [],
        ast: result.ast || null,
        symbolTable: result.semantic?.symbolTable || null,
        semanticErrors: result.semantic?.errors || [],
        error: errors[0],
        errors
    });
};