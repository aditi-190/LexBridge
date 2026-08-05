const TokenType = {
  NUMBER: "NUMBER",
  STRING: "STRING",
  IDENTIFIER: "IDENTIFIER",

  KEYWORD: "KEYWORD",

  OPERATOR: "OPERATOR",
  DELIMITER: "DELIMITER",

  NEWLINE: "NEWLINE",
  INDENT: "INDENT",
  DEDENT: "DEDENT",
  EOF: "EOF",
  UNKNOWN: "UNKNOWN"
};

class Token {
  constructor(type, value, line, column) {
    this.type = type;
    this.value = value;
    this.line = line;
    this.column = column;
  }
}

module.exports = { TokenType, Token };