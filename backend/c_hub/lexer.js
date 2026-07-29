// Token Types
const TokenType = {
    KEYWORD: "KEYWORD",
    IDENTIFIER: "IDENTIFIER",
    NUMBER: "NUMBER",
    OPERATOR: "OPERATOR",
    PUNCTUATION: "PUNCTUATION",
    EOF: "EOF"
};

// C Keywords (Project PDF অনুযায়ী)
const KEYWORDS = [
    "int",
    "float",
    "bool",
    "if",
    "else",
    "while",
    "print",
    "return",
    "true",
    "false",
    
];

// Operators
const OPERATORS = [
    "==",
    "!=",
    "<=",
    ">=",
    "&&",
    "||",
    "=",
    "+",
    "-",
    "*",
    "/",
    "%",
    "<",
    ">",
    "!"
];

// Punctuation
const PUNCTUATION = [
    "(",
    ")",
    "{",
    "}",
    ";",
    ","
];

class Lexer {

    constructor(source) {

        this.source = source;
        this.position = 0;
        this.tokens = [];
        this.errors = [];

        this.line = 1;
        this.column = 1;
    }

    peek(offset = 0) {

        return this.source[this.position + offset];

    }

    isAtEnd() {

        return this.position >= this.source.length;

    }

    advance() {

        const ch = this.source[this.position++];

        if (ch === "\n") {

            this.line++;
            this.column = 1;

        }

        else {

            this.column++;

        }

        return ch;

    }

    isDigit(ch) {

        return ch >= "0" && ch <= "9";

    }

    isLetter(ch) {

        return /[a-zA-Z_]/.test(ch);

    }

    skipWhitespace() {

        while (!this.isAtEnd()) {

            const ch = this.peek();

            if (/\s/.test(ch)) {

                this.advance();

            }

            else {

                break;

            }

        }

    }

    scanNumber() {

        const start = this.position;

        while (!this.isAtEnd() && this.isDigit(this.peek())) {

            this.advance();

        }

        if (this.peek() === "." && this.isDigit(this.peek(1))) {

            this.advance();

            while (!this.isAtEnd() && this.isDigit(this.peek())) {

                this.advance();

            }

        }

        return {

            type: TokenType.NUMBER,
            value: this.source.slice(start, this.position)

        };

    }

    scanIdentifier() {

        const start = this.position;

        while (
            !this.isAtEnd() &&
            /[a-zA-Z0-9_]/.test(this.peek())
        ) {

            this.advance();

        }

        const text = this.source.slice(start, this.position);

        return {

            type: KEYWORDS.includes(text)
                ? TokenType.KEYWORD
                : TokenType.IDENTIFIER,

            value: text

        };

    }

    matchOperator() {

        for (const op of OPERATORS) {

            if (this.source.startsWith(op, this.position)) {

                this.position += op.length;
                this.column += op.length;

                return {

                    type: TokenType.OPERATOR,
                    value: op

                };

            }

        }

        return null;

    }

    tokenize() {

        while (!this.isAtEnd()) {

            this.skipWhitespace();

            if (this.isAtEnd()) break;

            const line = this.line;
            const column = this.column;

            const ch = this.peek();

            let token = null;

            if (this.isDigit(ch)) {

                token = this.scanNumber();

            }

            else if (this.isLetter(ch)) {

                token = this.scanIdentifier();

            }

            else {

                token = this.matchOperator();

                if (!token && PUNCTUATION.includes(ch)) {

                    this.advance();

                    token = {

                        type: TokenType.PUNCTUATION,
                        value: ch

                    };

                }

            }

            if (!token) {

                this.errors.push({

                    message: `Invalid Character '${ch}'`,
                    line,
                    column

                });

                this.advance();

                continue;

            }

            token.line = line;
            token.column = column;

            this.tokens.push(token);

        }

        this.tokens.push({

            type: TokenType.EOF,
            value: "",
            line: this.line,
            column: this.column

        });

        return {

            tokens: this.tokens,
            errors: this.errors

        };

    }

}

function tokenizeC(source) {

    const lexer = new Lexer(source);

    return lexer.tokenize();

}

module.exports = {

    tokenizeC,
    TokenType

};