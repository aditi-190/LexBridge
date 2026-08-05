class Lexer {
  constructor(input) {
    this.input = input;
  }

  tokenize() {
    const tokens = [];
    const indentStack = [0];
    const lines = this.input.split("\n");

    for (let lineNo = 0; lineNo < lines.length; lineNo++) {
      const line = lines[lineNo];

      let indent = 0;
      let idx = 0;
      while (idx < line.length && (line[idx] === " " || line[idx] === "\t")) {
        indent += line[idx] === "\t" ? 4 : 1;
        idx++;
      }

      const rest = line.slice(idx);
      if (rest.trim() === "" || rest.trim().startsWith("#")) {
        continue;
      }

      if (indent > indentStack[indentStack.length - 1]) {
        indentStack.push(indent);
        tokens.push({ type: "INDENT", value: null, line: lineNo + 1 });
      } else {
        while (indent < indentStack[indentStack.length - 1]) {
          indentStack.pop();
          tokens.push({ type: "DEDENT", value: null, line: lineNo + 1 });
        }
      }

      this._tokenizeLine(rest, tokens, lineNo + 1);
      tokens.push({ type: "NEWLINE", value: null, line: lineNo + 1 });
    }

    while (indentStack.length > 1) {
      indentStack.pop();
      tokens.push({ type: "DEDENT", value: null });
    }

    tokens.push({ type: "EOF", value: null });
    return tokens;
  }

  _tokenizeLine(line, tokens, lineNo) {
    let pos = 0;

    while (pos < line.length) {
      const char = line[pos];

      if (/\s/.test(char)) {
        pos++;
        continue;
      }

      if (char === "#") {
        break; 
      }

      if (/[a-zA-Z_]/.test(char)) {
        let ident = "";
        while (pos < line.length && /[a-zA-Z0-9_]/.test(line[pos])) {
          ident += line[pos];
          pos++;
        }

        if (ident === "def") tokens.push({ type: "DEF", value: "def", line: lineNo });
        else if (ident === "return") tokens.push({ type: "RETURN", value: "return", line: lineNo });
        else if (ident === "if") tokens.push({ type: "IF", value: "if", line: lineNo });
        else if (ident === "else") tokens.push({ type: "ELSE", value: "else", line: lineNo });
        else if (ident === "while") tokens.push({ type: "WHILE", value: "while", line: lineNo });
        else if (ident === "True") tokens.push({ type: "NUMBER", value: 1, line: lineNo });
        else if (ident === "False") tokens.push({ type: "NUMBER", value: 0, line: lineNo });
        else tokens.push({ type: "IDENTIFIER", value: ident, line: lineNo });
        continue;
      }

      if (/[0-9]/.test(char)) {
        let num = "";
        while (pos < line.length && /[0-9]/.test(line[pos])) {
          num += line[pos];
          pos++;
        }
        tokens.push({ type: "NUMBER", value: parseInt(num, 10), line: lineNo });
        continue;
      }

      if (char === '"' || char === "'") {
        const quote = char;
        pos++;
        let str = "";
        while (pos < line.length && line[pos] !== quote) {
          str += line[pos];
          pos++;
        }
        pos++; // closing quote
        tokens.push({ type: "STRING", value: str, line: lineNo });
        continue;
      }

      if (char === "=") {
        if (line[pos + 1] === "=") {
          tokens.push({ type: "EQ", value: "==", line: lineNo });
          pos += 2;
        } else {
          tokens.push({ type: "ASSIGN", value: "=", line: lineNo });
          pos++;
        }
        continue;
      }

      if (char === "!" && line[pos + 1] === "=") {
        tokens.push({ type: "NEQ", value: "!=", line: lineNo });
        pos += 2;
        continue;
      }

      if (char === "<") {
        if (line[pos + 1] === "=") {
          tokens.push({ type: "LTE", value: "<=", line: lineNo });
          pos += 2;
        } else {
          tokens.push({ type: "LT", value: "<", line: lineNo });
          pos++;
        }
        continue;
      }

      if (char === ">") {
        if (line[pos + 1] === "=") {
          tokens.push({ type: "GTE", value: ">=", line: lineNo });
          pos += 2;
        } else {
          tokens.push({ type: "GT", value: ">", line: lineNo });
          pos++;
        }
        continue;
      }

      if (char === "+") { tokens.push({ type: "PLUS", value: "+", line: lineNo }); pos++; continue; }
      if (char === "-") { tokens.push({ type: "MINUS", value: "-", line: lineNo }); pos++; continue; }
      if (char === "*") { tokens.push({ type: "STAR", value: "*", line: lineNo }); pos++; continue; }
      if (char === "/") { tokens.push({ type: "SLASH", value: "/", line: lineNo }); pos++; continue; }
      if (char === "%") { tokens.push({ type: "MOD", value: "%", line: lineNo }); pos++; continue; }
      if (char === "(") { tokens.push({ type: "LPAREN", value: "(", line: lineNo }); pos++; continue; }
      if (char === ")") { tokens.push({ type: "RPAREN", value: ")", line: lineNo }); pos++; continue; }
      if (char === ":") { tokens.push({ type: "COLON", value: ":", line: lineNo }); pos++; continue; }
      if (char === ",") { tokens.push({ type: "COMMA", value: ",", line: lineNo }); pos++; continue; }

    
      pos++;
    }
  }
}

module.exports = Lexer;