const { compileAndExecutePython } = require("../python_hub/compilePython");

exports.compilePythonCode = (req, res) => {
  const { code, input } = req.body;

  if (!code || code.trim() === "") {
    return res.status(400).json({
      errors: ["Please provide valid Python code."]
    });
  }

  const result = compileAndExecutePython(code, input || "");

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