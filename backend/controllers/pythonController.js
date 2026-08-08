const { compilePythonCode } = require("../services/pythonCompiler");

exports.compilePythonCode = (req, res) => {
  const { code, input } = req.body;

  const result = compilePythonCode(code, input || "");

  if (!result.success) {
    return res.status(200).json({
      errors: result.errors
    });
  }

  return res.status(200).json({
    output: result.output,
    ast: result.ast,
    tac: result.tac,
    assembly: result.assembly
  });
};