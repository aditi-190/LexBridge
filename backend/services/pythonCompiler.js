const { compileAndExecutePython } = require("../python_hub/compilePython");

/**
 * Compiles and runs Python source code through the full pipeline
 * (lexer -> parser -> semantic analysis -> TAC -> optimizer -> target
 * code -> execution).
 *
 * @param {string} code - Python source code from the editor.
 * @param {string} input - Raw stdin text for input()/int(input()) calls.
 * @returns {object} Normalized result:
 *   On success: { success: true, output, ast, tac, assembly }
 *   On failure: { success: false, errors: string[] }
 */
function compilePythonCode(code, input = "") {

  if (!code || typeof code !== "string" || !code.trim()) {
    return {
      success: false,
      errors: ["Please provide valid Python code."]
    };
  }

  try {
    const result = compileAndExecutePython(code, input || "");

    if (!result || !result.success) {
      return {
        success: false,
        errors: (result && result.errors) || ["Compilation failed for an unknown reason."]
      };
    }

    return {
      success: true,
      output: result.output,
      ast: result.ast,
      tac: result.tac,
      assembly: result.assembly
    };
  } catch (err) {

    return {
      success: false,
      errors: [err.message || "Unexpected error while compiling Python code."]
    };
  }
}

module.exports = { compilePythonCode };