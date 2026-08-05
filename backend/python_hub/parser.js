class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.current = 0;
  }

  peek() {
    return this.tokens[this.current];
  }

  consume(type) {
    const token = this.peek();
    if (token.type === type) {
      this.current++;
      return token;
    }
    throw new Error(
      `Parse Error: Expected token ${type}, but got ${token.type}` +
      (token.line ? ` at line ${token.line}` : "")
    );
  }
  consumeStatementEnd() {
    if (this.peek().type === "NEWLINE") {
      this.consume("NEWLINE");
    }
  }


  parseBlock() {
    this.consume("NEWLINE");
    this.consume("INDENT");

    const statements = [];
    while (this.peek().type !== "DEDENT" && this.peek().type !== "EOF") {
      statements.push(this.parseStatement());
    }

    if (this.peek().type === "DEDENT") {
      this.consume("DEDENT");
    }

    return statements;
  }

  parse() {
    const body = [];
    while (this.peek().type !== "EOF") {
      if (this.peek().type === "NEWLINE") {
        this.consume("NEWLINE");
        continue;
      }
      body.push(this.parseStatement());
    }
    return { type: "Program", body };
  }

  parseStatement() {
    const token = this.peek();

    if (token.type === "DEF") {
      return this.parseFunctionDeclaration();
    }
    if (token.type === "RETURN") {
      return this.parseReturnStatement();
    }
    if (token.type === "IF") {
      return this.parseIfStatement();
    }
    if (token.type === "WHILE") {
      return this.parseWhileStatement();
    }
    return this.parseExpressionStatement();
  }

  parseFunctionDeclaration() {
    this.consume("DEF");
    const name = this.consume("IDENTIFIER").value;
    this.consume("LPAREN");
    const params = [];

    if (this.peek().type !== "RPAREN") {
      do {
        params.push(this.consume("IDENTIFIER").value);
        if (this.peek().type === "COMMA") {
          this.consume("COMMA");
        } else {
          break;
        }
      } while (true);
    }
    this.consume("RPAREN");
    this.consume("COLON");

    const body = this.parseBlock();

    return { type: "FunctionDeclaration", name, params, body };
  }

  parseReturnStatement() {
    this.consume("RETURN");
    const argument = this.parseExpression();
    this.consumeStatementEnd();
    return { type: "ReturnStatement", argument };
  }

  parseIfStatement() {
    this.consume("IF");
    const test = this.parseExpression();
    this.consume("COLON");
    const consequent = this.parseBlock();

    let alternate = null;
    if (this.peek().type === "ELSE") {
      this.consume("ELSE");
      this.consume("COLON");
      alternate = this.parseBlock();
    }

    return { type: "IfStatement", test, consequent, alternate };
  }

  parseWhileStatement() {
    this.consume("WHILE");
    const test = this.parseExpression();
    this.consume("COLON");
    const body = this.parseBlock();
    return { type: "WhileStatement", test, body };
  }

  parseExpressionStatement() {
    const expr = this.parseExpression();
    this.consumeStatementEnd();
    return { type: "ExpressionStatement", expression: expr };
  }

  parseExpression() {
    return this.parseAssignment();
  }

  parseAssignment() {
    let expr = this.parseEquality();

    if (this.peek().type === "ASSIGN") {
      this.consume("ASSIGN");
      const right = this.parseAssignment();
      return { type: "AssignmentExpression", left: expr.name || expr.value, right };
    }
    return expr;
  }

  parseEquality() {
    let expr = this.parseComparison();
    while (["EQ", "NEQ"].includes(this.peek().type)) {
      const op = this.consume(this.peek().type).value;
      const right = this.parseComparison();
      expr = { type: "BinaryExpression", op, left: expr, right };
    }
    return expr;
  }

  parseComparison() {
    let expr = this.parseAdditive();
    while (["LT", "GT", "LTE", "GTE"].includes(this.peek().type)) {
      const op = this.consume(this.peek().type).value;
      const right = this.parseAdditive();
      expr = { type: "BinaryExpression", op, left: expr, right };
    }
    return expr;
  }

  parseAdditive() {
    let expr = this.parseMultiplicative();
    while (["PLUS", "MINUS"].includes(this.peek().type)) {
      const op = this.consume(this.peek().type).value;
      const right = this.parseMultiplicative();
      expr = { type: "BinaryExpression", op, left: expr, right };
    }
    return expr;
  }

  parseMultiplicative() {
    let expr = this.parsePrimary();
    while (["STAR", "SLASH", "MOD"].includes(this.peek().type)) {
      const op = this.consume(this.peek().type).value;
      const right = this.parsePrimary();
      expr = { type: "BinaryExpression", op, left: expr, right };
    }
    return expr;
  }

  parsePrimary() {
    const token = this.peek();

    if (token.type === "NUMBER") {
      this.consume("NUMBER");
      return { type: "Literal", value: token.value };
    }

    if (token.type === "STRING") {
      this.consume("STRING");
      return { type: "Literal", value: token.value };
    }

    if (token.type === "IDENTIFIER") {
      const name = this.consume("IDENTIFIER").value;

      if (this.peek().type === "LPAREN") {
        this.consume("LPAREN");
        const args = [];
        if (this.peek().type !== "RPAREN") {
          do {
            args.push(this.parseExpression());
            if (this.peek().type === "COMMA") {
              this.consume("COMMA");
            } else {
              break;
            }
          } while (true);
        }
        this.consume("RPAREN");
        return { type: "CallExpression", name, args };
      }

      return { type: "Identifier", name };
    }

    if (token.type === "LPAREN") {
      this.consume("LPAREN");
      const expr = this.parseExpression();
      this.consume("RPAREN");
      return expr;
    }

    throw new Error(
      `Unexpected token in expression: ${token.type}` +
      (token.line ? ` at line ${token.line}` : "")
    );
  }
}

module.exports = Parser;