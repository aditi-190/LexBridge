const TokenType = {
    KEYWORD: "KEYWORD",
    IDENTIFIER: "IDENTIFIER",
    NUMBER: "NUMBER",
    STRING: "STRING",
    OPERATOR: "OPERATOR",
    PUNCTUATION: "PUNCTUATION",
    EOF: "EOF"
};
const KEYWORDS = [
    "public",
    "class",
    "static",
    "void",
    "main",
    "String",

    "int",
    "float",
    "double",
    "char",
    "boolean",

    "if",
    "else",
    "while",
    "for",

    "true",
    "false",

    "return"
];
const OPERATORS = [
    "==",
    "!=",
    "<=",
    ">=",
    "&&",
    "||",
    "++",
    "--",

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
const PUNCTUATION = [
    "(",
    ")",
    "{",
    "}",
    "[",
    "]",
    ";",
    ",",
    "."
];
class Lexer {

    constructor(source) {

        this.source = source;

        this.position = 0;

        this.line = 1;

        this.column = 1;

        this.tokens = [];

        this.errors = [];

    }

    peek(offset = 0) {

        return this.source[this.position + offset];

    }

    isAtEnd() {

        return this.position >= this.source.length;

    }

    advance() {

        const ch = this.source[this.position];

        this.position++;

        if (ch === "\n") {

            this.line++;

            this.column = 1;

        } else {

            this.column++;

        }

        return ch;

    }

    isDigit(ch) {

        return ch >= "0" && ch <= "9";

    }

    isLetter(ch) {

        return (
            (ch >= "a" && ch <= "z") ||
            (ch >= "A" && ch <= "Z") ||
            ch === "_" ||
            ch === "$"
        );

    }

    isLetterOrDigit(ch) {

        return this.isLetter(ch) || this.isDigit(ch);

    }

    skipWhitespace() {

        while (!this.isAtEnd()) {

            const ch = this.peek();

            if (
                ch === " " ||
                ch === "\t" ||
                ch === "\r" ||
                ch === "\n"
            ) {

                this.advance();
            }

            else if (ch === "/" && this.peek(1) === "/") {

                while (!this.isAtEnd() && this.peek() !== "\n") {

                    this.advance();

                }

            }

            else if (ch === "/" && this.peek(1) === "*") {

                this.advance();
                this.advance();

                while (
                    !this.isAtEnd() &&
                    !(this.peek() === "*" && this.peek(1) === "/")
                ) {

                    this.advance();

                }

                if (!this.isAtEnd()) {

                    this.advance();
                    this.advance();

                }

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

        if (
            this.peek() === "." &&
            this.isDigit(this.peek(1))
        ) {

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
            this.isLetterOrDigit(this.peek())
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
    scanString() {

        this.advance();

        let value = "";

        while (
            !this.isAtEnd() &&
            this.peek() !== '"'
        ) {

            value += this.advance();

        }

        if (!this.isAtEnd()) {

            this.advance();

        }

        return {

            type: TokenType.STRING,

            value

        };

    }
    matchOperator() {

        for (const op of OPERATORS) {

            if (this.source.startsWith(op, this.position)) {

                return {

                    value: op,

                    length: op.length

                };

            }

        }

        return null;

    }
    tokenize() {

        while (!this.isAtEnd()) {

            this.skipWhitespace();

            if (this.isAtEnd()) break;

            const startLine = this.line;
            const startColumn = this.column;

            const ch = this.peek();

            let token = null;

            if (this.isDigit(ch)) {

                token = this.scanNumber();

            }

            else if (this.isLetter(ch)) {

                token = this.scanIdentifier();

            }

            else if (ch === '"') {

                token = this.scanString();

            }

            else {

                const op = this.matchOperator();

                if (op) {

                    this.position += op.length;
                    this.column += op.length;

                    token = {

                        type: TokenType.OPERATOR,
                        value: op.value

                    };

                }

                else if (PUNCTUATION.includes(ch)) {

                    this.advance();

                    token = {

                        type: TokenType.PUNCTUATION,
                        value: ch

                    };

                }

                else {

                    this.errors.push({

                        message: `Invalid Character '${ch}'`,
                        line: startLine,
                        column: startColumn

                    });

                    this.advance();

                    continue;

                }

            }

            token.line = startLine;
            token.column = startColumn;

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
function tokenizeJava(source) {

    const lexer = new Lexer(source);

    return lexer.tokenize();

}

module.exports = {

    tokenizeJava,

    TokenType

};