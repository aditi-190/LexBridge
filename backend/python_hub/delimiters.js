const PYTHON_DELIMITERS = new Set([
  "(", ")", "[", "]", "{", "}",
  ":", ",", ";", "."
]);

function isDelimiter(char) {
  return PYTHON_DELIMITERS.has(char);
}

module.exports = { PYTHON_DELIMITERS, isDelimiter };