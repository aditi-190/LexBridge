const TokenType = {
    KEYWORD: "KEYWORD",
    IDENTIFIER: "IDENTIFIER",
    INTEGER: "INTEGER",
    FLOAT: "FLOAT",
    STRING: "STRING",
    OPERATOR: "OPERATOR",

    LPAREN: "LPAREN",
    RPAREN: "RPAREN",
    LBRACE: "LBRACE",
    RBRACE: "RBRACE",
    LBRACKET: "LBRACKET",
    RBRACKET: "RBRACKET",
    SEMICOLON: "SEMICOLON",
    COMMA: "COMMA",

    EOF: "EOF"
};
const KEYWORDS = [
    "int",
    "float",
    "bool",

    "if",
    "else",
    "while",
    "print",

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

const PUNCTUATION = {

    "(": TokenType.LPAREN,
    ")": TokenType.RPAREN,

    "{": TokenType.LBRACE,
    "}": TokenType.RBRACE,

    "[": TokenType.LBRACKET,
    "]": TokenType.RBRACKET,

    ";": TokenType.SEMICOLON,
    ",": TokenType.COMMA

};


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

        if (this.isAtEnd()) {

            return "";

        }

        const ch = this.source[this.position];

        this.position++;

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

        if (!ch) return false;

        return (
            (ch >= "a" && ch <= "z") ||
            (ch >= "A" && ch <= "Z") ||
            ch === "_"
        );

    }

    isLetterOrDigit(ch) {

        return this.isLetter(ch) || this.isDigit(ch);

    }

    skipWhitespaceAndComments() {

        while (!this.isAtEnd()) {

            const ch = this.peek();

            // Spaces / tabs / newline
            if (
                ch === " " ||
                ch === "\t" ||
                ch === "\r" ||
                ch === "\n"
            ) {

                this.advance();

                continue;

            }

            if (
                ch === "/" &&
                this.peek(1) === "/"
            ) {

                this.advance();
                this.advance();

                while (
                    !this.isAtEnd() &&
                    this.peek() !== "\n"
                ) {

                    this.advance();

                }

                continue;

            }

            if (
                ch === "/" &&
                this.peek(1) === "*"
            ) {

                const startLine = this.line;
                const startColumn = this.column;

                this.advance();
                this.advance();

                while (!this.isAtEnd()) {

                    if (
                        this.peek() === "*" &&
                        this.peek(1) === "/"
                    ) {

                        this.advance();
                        this.advance();

                        break;

                    }

                    this.advance();

                }

                // Unclosed comment
                if (this.isAtEnd()) {

                    this.errors.push({

                        message: "Unterminated comment",

                        line: startLine,

                        column: startColumn

                    });

                }

                continue;

            }


            break;

        }

    }

    scanNumber() {

        const start = this.position;

        let isFloat = false;


        // Integer part
        while (
            !this.isAtEnd() &&
            this.isDigit(this.peek())
        ) {

            this.advance();

        }


        // Decimal part
        if (
            this.peek() === "." &&
            this.isDigit(this.peek(1))
        ) {

            isFloat = true;

            this.advance();

            while (
                !this.isAtEnd() &&
                this.isDigit(this.peek())
            ) {

                this.advance();

            }

        }


        const value = this.source.slice(
            start,
            this.position
        );


        return {

            type: isFloat
                ? TokenType.FLOAT
                : TokenType.INTEGER,

            tokenName: isFloat
                ? TokenType.FLOAT
                : TokenType.INTEGER,

            value

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


        const text = this.source.slice(
            start,
            this.position
        );


        if (KEYWORDS.includes(text)) {

            return {

                type: TokenType.KEYWORD,

                tokenName: TokenType.KEYWORD,

                value: text

            };

        }


        return {

            type: TokenType.IDENTIFIER,

            tokenName: TokenType.IDENTIFIER,

            value: text

        };

    }


    scanString() {

        const startLine = this.line;

        const startColumn = this.column;

        this.advance(); // opening "

        let value = "";

        while (
            !this.isAtEnd() &&
            this.peek() !== '"'
        ) {

            value += this.advance();

        }


        if (this.isAtEnd()) {

            this.errors.push({

                message: "Unterminated string",

                line: startLine,

                column: startColumn

            });

            return null;

        }


        this.advance(); // closing "

        return {

            type: TokenType.STRING,

            tokenName: TokenType.STRING,

            value

        };

    }


    matchOperator() {

        // Longest match first

        for (const op of OPERATORS) {

            if (
                this.source.startsWith(
                    op,
                    this.position
                )
            ) {

                this.position += op.length;

                this.column += op.length;

                return {

                    type: TokenType.OPERATOR,

                    tokenName: TokenType.OPERATOR,

                    value: op

                };

            }

        }

        return null;

    }


    // ======================================
    // MAIN TOKENIZE FUNCTION
    // ======================================

    tokenize() {

        while (!this.isAtEnd()) {

            // Skip whitespace/comments
            this.skipWhitespaceAndComments();

            if (this.isAtEnd()) {

                break;

            }


            const startLine = this.line;

            const startColumn = this.column;

            const ch = this.peek();

            let token = null;


            // --------------------------------
            // Number
            // --------------------------------

            if (this.isDigit(ch)) {

                token = this.scanNumber();

            }


            // --------------------------------
            // Identifier / Keyword
            // --------------------------------

            else if (this.isLetter(ch)) {

                token = this.scanIdentifier();

            }


            // --------------------------------
            // String
            // --------------------------------

            else if (ch === '"') {

                token = this.scanString();

            }


            // --------------------------------
            // Operator
            // --------------------------------

            else {

                token = this.matchOperator();


                // --------------------------------
                // Punctuation
                // --------------------------------

                if (!token && PUNCTUATION[ch]) {

                    this.advance();

                    token = {

                        type: PUNCTUATION[ch],

                        tokenName: PUNCTUATION[ch],

                        value: ch

                    };

                }

            }

            if (!token) {

                this.errors.push({

                    message: `Invalid Character '${ch}'`,

                    line: startLine,

                    column: startColumn

                });

                this.advance();

                continue;

            }

            token.line = startLine;

            token.column = startColumn;


            this.tokens.push(token);

        }

        // EOF TOKEN
        this.tokens.push({

            type: TokenType.EOF,

            tokenName: TokenType.EOF,

            value: "EOF",

            line: this.line,

            column: this.column

        });


        return {

            tokens: this.tokens,

            errors: this.errors

        };

    }

}

// PUBLIC FUNCTION
function tokenizeC(source) {

    const lexer = new Lexer(source);

    return lexer.tokenize();

}

module.exports = {

    tokenizeC,

    TokenType

};