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

      // FIX/NEW: f-strings (f"...{expr}...") had no support at all —
      // the lexer read the leading `f` as a normal IDENTIFIER, then the
      // quoted text as a completely separate STRING token, which the
      // parser couldn't reconcile (hence "Expected RPAREN, got STRING").
      // Detected here (before the generic identifier branch, since 'f'
      // would otherwise match that regex) and tokenized as one FSTRING
      // token carrying the raw template text with {..} placeholders
      // still inside it — the parser expands those into concatenation.
      if ((char === "f" || char === "F") && (line[pos + 1] === '"' || line[pos + 1] === "'")) {
        pos++; // skip 'f'
        const quote = line[pos];
        pos++; // skip opening quote
        let raw = "";
        while (pos < line.length && line[pos] !== quote) {
          if (line[pos] === "\\" && pos + 1 < line.length) {
            const next = line[pos + 1];
            if (next === "n") raw += "\n";
            else if (next === "t") raw += "\t";
            else raw += next;
            pos += 2;
            continue;
          }
          raw += line[pos];
          pos++;
        }
        pos++; // closing quote
        tokens.push({ type: "FSTRING", value: raw, line: lineNo });
        continue;
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
        // FIX: "elif" had no token at all — it fell through to plain
        // IDENTIFIER, which broke `if/elif/else` chains completely.
        else if (ident === "elif") tokens.push({ type: "ELIF", value: "elif", line: lineNo });
        else if (ident === "else") tokens.push({ type: "ELSE", value: "else", line: lineNo });
        else if (ident === "while") tokens.push({ type: "WHILE", value: "while", line: lineNo });
        // NEW: custom `do` keyword for the do-while extension.
        else if (ident === "do") tokens.push({ type: "DO", value: "do", line: lineNo });
        // FIX: "for" / "in" had no tokens at all — `for` loops couldn't
        // be written in this language before.
        else if (ident === "for") tokens.push({ type: "FOR", value: "for", line: lineNo });
        else if (ident === "in") tokens.push({ type: "IN", value: "in", line: lineNo });
        // FIX: "and" / "or" / "not" (Python's boolean operators) had no
        // tokens, so `if a > 0 and b > 0:` couldn't be parsed.
        else if (ident === "and") tokens.push({ type: "AND", value: "and", line: lineNo });
        else if (ident === "or") tokens.push({ type: "OR", value: "or", line: lineNo });
        else if (ident === "not") tokens.push({ type: "NOT", value: "not", line: lineNo });
        else if (ident === "True") tokens.push({ type: "NUMBER", value: 1, line: lineNo });
        else if (ident === "False") tokens.push({ type: "NUMBER", value: 0, line: lineNo });
        else tokens.push({ type: "IDENTIFIER", value: ident, line: lineNo });
        continue;
      }

      if (/[0-9]/.test(char)) {
        let num = "";
        let isFloat = false;
        while (
          pos < line.length &&
          (/[0-9]/.test(line[pos]) || (line[pos] === "." && !isFloat && /[0-9]/.test(line[pos + 1] || "")))
        ) {
          if (line[pos] === ".") isFloat = true;
          num += line[pos];
          pos++;
        }
        tokens.push({ type: "NUMBER", value: isFloat ? parseFloat(num) : parseInt(num, 10), line: lineNo });
        continue;
      }

      if (char === '"' || char === "'") {
        const quote = char;
        pos++;
        let str = "";
        // FIX: no escape-sequence handling — a quote preceded by '\'
        // (e.g. "He said \"hi\"") would terminate the string early.
        while (pos < line.length && line[pos] !== quote) {
          if (line[pos] === "\\" && pos + 1 < line.length) {
            const next = line[pos + 1];
            if (next === "n") str += "\n";
            else if (next === "t") str += "\t";
            else str += next;
            pos += 2;
            continue;
          }
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