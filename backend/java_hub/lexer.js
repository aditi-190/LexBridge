const keywords = require("./keywords");
const tokenTypes = require("./token");
const operators = require("./operators");
const delimiters = require("./delimiters");

function lexer(code) {
    let tokens = [];
    let i = 0;
    let line = 1;
    let column = 1;

    while (i < code.length) {
        let char = code[i];

        if (char === " " || char === "\t" || char === "\r") {
            i++;
            column++;
            continue;
        }

        if (char === "\n") {
            i++;
            line++;
            column = 1;
            continue;
        }

        if (/[a-zA-Z_]/.test(char)) {
            let word = "";
            let startColumn = column;

            while (i < code.length && /[a-zA-Z0-9_]/.test(code[i])) {
                word += code[i];
                i++;
                column++;
            }

            if (word === "true" || word === "false") {
                tokens.push({
                    type: tokenTypes.BOOLEAN,
                    value: word,
                    line,
                    column: startColumn
                });
                continue;
            }

            if (keywords.includes(word)) {
                tokens.push({
                    type: tokenTypes.KEYWORD,
                    value: word,
                    line,
                    column: startColumn
                });
            } else {
                tokens.push({
                    type: tokenTypes.IDENTIFIER,
                    value: word,
                    line,
                    column: startColumn
                });
            }
            continue;
        }

        if (/[0-9]/.test(char)) {
            let number = "";
            let startColumn = column;
            let hasDot = false;

            while (i < code.length && (/[0-9]/.test(code[i]) || code[i] === ".")) {
                if (code[i] === ".") {
                    if (hasDot) break;
                    hasDot = true;
                }
                number += code[i];
                i++;
                column++;
            }

            tokens.push({
                type: hasDot ? tokenTypes.FLOAT : tokenTypes.INTEGER,
                value: number,
                line,
                column: startColumn
            });
            continue;
        }

        if (char === '"') {
            let startColumn = column;
            i++;
            column++;
            let text = "";

            while (i < code.length && code[i] !== '"') {
                text += code[i];
                i++;
                column++;
            }

            if (i >= code.length) {
                throw new Error(`Unterminated string at line ${line}`);
            }

            i++;
            column++;

            tokens.push({
                type: tokenTypes.STRING,
                value: text,
                line,
                column: startColumn
            });
            continue;
        }

        if (char === "/" && code[i + 1] === "/") {
            while (i < code.length && code[i] !== "\n") {
                i++;
                column++;
            }
            continue;
        }
        if (char === "/" && code[i + 1] === "*") {
            i += 2;
            column += 2;

            while (i < code.length && !(code[i] === "*" && code[i + 1] === "/")) {
                if (code[i] === "\n") {
                    line++;
                    column = 1;
                    i++;
                    continue;
                }
                i++;
                column++;
            }

            i += 2;
            column += 2;
            continue;
        }

        let twoChar = code.substring(i, i + 2);
        if (operators.includes(twoChar)) {
            tokens.push({
                type: tokenTypes.OPERATOR,
                value: twoChar,
                line,
                column
            });
            i += 2;
            column += 2;
            continue;
        }

        if (operators.includes(char)) {
            tokens.push({
                type: tokenTypes.OPERATOR,
                value: char,
                line,
                column
            });
            i++;
            column++;
            continue;
        }

        switch (char) {
            case "(":
                tokens.push({ type: tokenTypes.LPAREN, value: "(", line, column });
                break;
            case ")":
                tokens.push({ type: tokenTypes.RPAREN, value: ")", line, column });
                break;
            case "{":
                tokens.push({ type: tokenTypes.LBRACE, value: "{", line, column });
                break;
            case "}":
                tokens.push({ type: tokenTypes.RBRACE, value: "}", line, column });
                break;
            case "[":
                tokens.push({ type: tokenTypes.LBRACKET, value: "[", line, column });
                break;
            case "]":
                tokens.push({ type: tokenTypes.RBRACKET, value: "]", line, column });
                break;
            case ";":
                tokens.push({ type: tokenTypes.SEMICOLON, value: ";", line, column });
                break;
            case ",":
                tokens.push({ type: tokenTypes.COMMA, value: ",", line, column });
                break;
            default:
                throw new Error(`Unexpected character '${char}' at line ${line}, column ${column}`);
        }

        i++;
        column++;
    }

    tokens.push({
        type: tokenTypes.EOF,
        value: "EOF",
        line,
        column
    });

    return tokens;
}

module.exports = lexer;