const PYTHON_OPERATORS = [
  "==", "!=", "<=", ">=", "//", "**",
  "+", "-", "*", "/", "%", "=", "<", ">"
];

function isOperatorChar(char) {
  return /[\+\-\*\/\%\=\<\>\!]/.test(char);
}

module.exports = { PYTHON_OPERATORS, isOperatorChar };