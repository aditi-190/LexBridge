// Python Supported Keywords List
const PYTHON_KEYWORDS = new Set([
  "and", "as", "assert", "async", "await", "break", "class", "continue",
  "def", "del", "elif", "else", "except", "False", "finally", "for",
  "from", "global", "if", "import", "in", "is", "lambda", "None",
  "nonlocal", "not", "or", "pass", "raise", "return", "True", "try",
  "while", "with", "yield", "print"
]);

function isKeyword(word) {
  return PYTHON_KEYWORDS.has(word);
}

module.exports = { PYTHON_KEYWORDS, isKeyword };