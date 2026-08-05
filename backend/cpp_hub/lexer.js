const TokenType = {
    KEYWORD: "KEYWORD",
    IDENTIFIER: "IDENTIFIER",

    INTEGER: "INTEGER",
    FLOAT: "FLOAT",
    STRING: "STRING",

    HEADER: "HEADER",

    OPERATOR: "OPERATOR",

    LPAREN: "LPAREN",
    RPAREN: "RPAREN",

    LBRACE: "LBRACE",
    RBRACE: "RBRACE",

    LBRACKET: "LBRACKET",
    RBRACKET: "RBRACKET",

    SEMICOLON: "SEMICOLON",
    COMMA: "COMMA",

    EOF: "EOF",
    HASH: "HASH"
};

const KEYWORDS = [

    "int",
    "float",
    "double",
    "char",
    "bool",
    "void",

    "if",
    "else",
    "while",
    "for",
    "return",

    "true",
    "false",

    "class",
    "public",
    "private",
    "protected",

    "using",
    "namespace",

    "include",

    "cin",
    "cout",

    "endl",
   "do",

"break",

"continue",

"switch",

"case",

"default"


];

const OPERATORS = [

   
"<<",
">>",

"==",
"!=",
"<=",
">=",

"&&",
"||",

"++",
"--",

"+=",
"-=",
"*=",
"/=",

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
    ",": TokenType.COMMA,
    "#": TokenType.HASH,

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

            if (
                ch === " " ||
                ch === "\t" ||
                ch === "\r" ||
                ch === "\n"
            ) {
                this.advance();
                continue;
            }

            // Single line comment
            if (ch === "/" && this.peek(1) === "/") {

                while (!this.isAtEnd() && this.peek() !== "\n") {
                    this.advance();
                }

                continue;
            }

            // Multi line comment
            if (ch === "/" && this.peek(1) === "*") {

                this.advance();
                this.advance();

                while (!this.isAtEnd()) {

                    if (this.peek() === "*" && this.peek(1) === "/") {
                        this.advance();
                        this.advance();
                        break;
                    }

                    this.advance();
                }

                continue;
            }

            break;
        }
    }

    scanNumber() {

        const start = this.position;

        let isFloat = false;

        while (!this.isAtEnd() && this.isDigit(this.peek())) {
            this.advance();
        }

        if (this.peek() === "." && this.isDigit(this.peek(1))) {

            isFloat = true;

            this.advance();

            while (!this.isAtEnd() && this.isDigit(this.peek())) {
                this.advance();
            }

        }

        const value = this.source.slice(start, this.position);

        return {

            type: isFloat ? TokenType.FLOAT : TokenType.INTEGER,

            value,

            tokenName: isFloat ? "FLOAT" : "INTEGER"

        };

    }

    scanIdentifier() {

        const start = this.position;

        while (!this.isAtEnd() && this.isLetterOrDigit(this.peek())) {

            this.advance();

        }

        const text = this.source.slice(start, this.position);

        if (KEYWORDS.includes(text)) {

            return {

                type: TokenType.KEYWORD,

                value: text,

                tokenName: "KEYWORD"

            };

        }

        return {

            type: TokenType.IDENTIFIER,

            value: text,

            tokenName: "IDENTIFIER"

        };

    }

    scanString() {

        this.advance();

        let value = "";

        while (!this.isAtEnd() && this.peek() !== '"') {

            value += this.advance();

        }

        this.advance();

        return {

            type: TokenType.STRING,

            value,

            tokenName: "STRING"

        };

    }
    matchOperator() {

    console.log("Checking:", this.source.substring(this.position, this.position + 5));

    for (const op of OPERATORS) {

        if (this.source.startsWith(op, this.position)) {

            console.log("Matched:", op);

            this.position += op.length;
            this.column += op.length;

            return {
                type: TokenType.OPERATOR,
                value: op,
                tokenName: "OPERATOR"
            };
        }
    }

    return null;
}
        tokenize() {

        while (!this.isAtEnd()) {

            this.skipWhitespaceAndComments();

            if (this.isAtEnd()) {
                break;
            }

            const startLine = this.line;
            const startColumn = this.column;

            const ch = this.peek();

            
            // Number
            if (this.isDigit(ch)) {

                const token = this.scanNumber();

                token.line = startLine;
                token.column = startColumn;

                this.tokens.push(token);

                continue;

            }

            // Identifier / Keyword
            if (this.isLetter(ch)) {

                const token = this.scanIdentifier();

                token.line = startLine;
                token.column = startColumn;

                this.tokens.push(token);

                continue;

            }

           
            // String
            if (ch === '"') {

                const token = this.scanString();

                token.line = startLine;
                token.column = startColumn;

                this.tokens.push(token);

                continue;

            }

            // Operator
            const op = this.matchOperator();

            if (op) {

                op.line = startLine;
                op.column = startColumn;

                this.tokens.push(op);

                continue;

            }

            // Punctuation
            if (PUNCTUATION[ch]) {

                this.tokens.push({

                    type: PUNCTUATION[ch],

                    value: ch,

                    tokenName: PUNCTUATION[ch],

                    line: startLine,

                    column: startColumn

                });

                this.advance();

                continue;

            }

            // Unknown Character
            this.errors.push({

                message: `Unexpected character '${ch}'`,

                line: startLine,

                column: startColumn

            });

            this.advance();

        }

        this.tokens.push({

            type: TokenType.EOF,

            value: "",

            tokenName: "EOF",

            line: this.line,

            column: this.column

        });

        return {

            tokens: this.tokens,

            errors: this.errors

        };

    }

}

function tokenizeCPP(source) {

    const lexer = new Lexer(source);

    return lexer.tokenize();

}

module.exports = {

    TokenType,

    tokenizeCPP

};