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
    if (token.type === "FOR") {
      return this.parseForStatement();
    }
  
    if (token.type === "DO") {
      return this.parseDoWhileStatement();
    }
    if (token.type === "BREAK") {
      this.consume("BREAK");
      this.consumeStatementEnd();
      return { type: "BreakStatement" };
    }
    if (token.type === "CONTINUE") {
      this.consume("CONTINUE");
      this.consumeStatementEnd();
      return { type: "ContinueStatement" };
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
  
    if (this.peek().type === "ELIF") {
      alternate = [this.parseElifChain()];
    } else if (this.peek().type === "ELSE") {
      this.consume("ELSE");
      this.consume("COLON");
      alternate = this.parseBlock();
    }

    return { type: "IfStatement", test, consequent, alternate };
  }

  parseElifChain() {
    this.consume("ELIF");
    const test = this.parseExpression();
    this.consume("COLON");
    const consequent = this.parseBlock();

    let alternate = null;
    if (this.peek().type === "ELIF") {
      alternate = [this.parseElifChain()];
    } else if (this.peek().type === "ELSE") {
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

  parseForStatement() {
    this.consume("FOR");
    const varName = this.consume("IDENTIFIER").value;
    this.consume("IN");
    const iterable = this.parseExpression();
    this.consume("COLON");
    const body = this.parseBlock();
    return { type: "ForStatement", varName, iterable, body };
  }

  parseDoWhileStatement() {
    this.consume("DO");
    this.consume("COLON");
    const body = this.parseBlock();
    this.consume("WHILE");
    const test = this.parseExpression();
    this.consumeStatementEnd();
    return { type: "DoWhileStatement", test, body };
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
    let expr = this.parseLogicalOr();

    if (this.peek().type === "ASSIGN") {
      this.consume("ASSIGN");
      const right = this.parseAssignment();
    
      if (expr.type === "ArrayAccess") {
        return {
          type: "IndexAssignmentExpression",
          object: expr.object,
          index: expr.index,
          right
        };
      }
      return { type: "AssignmentExpression", left: expr.name || expr.value, right };
    }
    return expr;
  }

  parseLogicalOr() {
    let expr = this.parseLogicalAnd();
    while (this.peek().type === "OR") {
      this.consume("OR");
      const right = this.parseLogicalAnd();
      expr = { type: "BinaryExpression", op: "or", left: expr, right };
    }
    return expr;
  }

  parseLogicalAnd() {
    let expr = this.parseLogicalNot();
    while (this.peek().type === "AND") {
      this.consume("AND");
      const right = this.parseLogicalNot();
      expr = { type: "BinaryExpression", op: "and", left: expr, right };
    }
    return expr;
  }

  parseLogicalNot() {
    if (this.peek().type === "NOT") {
      this.consume("NOT");
      const argument = this.parseLogicalNot();
      return { type: "UnaryExpression", op: "not", argument };
    }
    return this.parseEquality();
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
    let expr = this.parseUnary();
    while (["STAR", "SLASH", "MOD"].includes(this.peek().type)) {
      const op = this.consume(this.peek().type).value;
      const right = this.parseUnary();
      expr = { type: "BinaryExpression", op, left: expr, right };
    }
    return expr;
  }

  parseUnary() {
    if (this.peek().type === "MINUS") {
      this.consume("MINUS");
      const argument = this.parseUnary();
      return { type: "UnaryExpression", op: "-", argument };
    }
    return this.parsePrimary();
  }

  parsePrimary() {
    const token = this.peek();

    if (token.type === "NUMBER") {
      this.consume("NUMBER");
      return { type: "Literal", value: token.value };
    }

    if (token.type === "BOOLEAN") {
      this.consume("BOOLEAN");
      return { type: "Literal", value: token.value };
    }

    if (token.type === "STRING") {
      this.consume("STRING");
      return { type: "Literal", value: token.value };
    }

    if (token.type === "FSTRING") {
      this.consume("FSTRING");
      return this.buildFStringExpression(token.value);
    }

    if (token.type === "LBRACKET") {
      this.consume("LBRACKET");
      const elements = [];
      if (this.peek().type !== "RBRACKET") {
        do {
          elements.push(this.parseExpression());
          if (this.peek().type === "COMMA") {
            this.consume("COMMA");
          } else {
            break;
          }
        } while (true);
      }
      this.consume("RBRACKET");
      return { type: "ArrayLiteral", elements };
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

      if (this.peek().type === "LBRACKET") {
        this.consume("LBRACKET");
        const index = this.parseExpression();
        this.consume("RBRACKET");
        return { type: "ArrayAccess", object: name, index };
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
  buildFStringExpression(template) {
    const parts = [];
    const regex = /\{([^}]*)\}/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(template)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: "Literal", value: template.slice(lastIndex, match.index) });
      }
      const exprSrc = match[1].trim();
      parts.push(this._parseInlineExpression(exprSrc));
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < template.length) {
      parts.push({ type: "Literal", value: template.slice(lastIndex) });
    }

    if (parts.length === 0) {
      return { type: "Literal", value: "" };
    }

    let expr = parts[0];
    for (let i = 1; i < parts.length; i++) {
      expr = { type: "BinaryExpression", op: "+", left: expr, right: parts[i] };
    }
    return expr;
  }


  _parseInlineExpression(exprSrc) {
    if (exprSrc === "") {
      return { type: "Literal", value: "" };
    }
    const Lexer = require("./lexer");
    const innerTokens = [];
    new Lexer("")._tokenizeLine(exprSrc, innerTokens, 0);
    innerTokens.push({ type: "EOF", value: null });
    const innerParser = new Parser(innerTokens);
    return innerParser.parseExpression();
  }
}

module.exports = Parser;