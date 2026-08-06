// ==========================================
// TOKEN TYPES
// ==========================================

const TokenType = {

    KEYWORD: "KEYWORD",

    IDENTIFIER: "IDENTIFIER",

    INTEGER: "INTEGER",

    FLOAT: "FLOAT",

    STRING: "STRING",

    OPERATOR: "OPERATOR",


    // Punctuation

    LPAREN: "LPAREN",

    RPAREN: "RPAREN",

    LBRACE: "LBRACE",

    RBRACE: "RBRACE",

    LBRACKET: "LBRACKET",

    RBRACKET: "RBRACKET",

    SEMICOLON: "SEMICOLON",

    COMMA: "COMMA",


    // Preprocessor / header tokens

    HASH: "HASH",

    DOT: "DOT",


    EOF: "EOF",
  

};


// ==========================================
// KEYWORDS
// ==========================================

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

    "return",

    "include",

    "for",
    "do",
    "scanf",
      "char"


];


// ==========================================
// OPERATORS
// ==========================================

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

    "!",
    "&"

];


// ==========================================
// SINGLE CHARACTER PUNCTUATION
// ==========================================

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

    ".": TokenType.DOT

};


// ==========================================
// LEXER CLASS
// ==========================================

class Lexer {

    constructor(source) {

        this.source = source;

        this.position = 0;

        this.line = 1;

        this.column = 1;

        this.tokens = [];

        this.errors = [];

    }


    // ======================================
    // PEEK
    // ======================================

    peek(offset = 0) {

        return this.source[
            this.position + offset
        ];

    }


    // ======================================
    // END CHECK
    // ======================================

    isAtEnd() {

        return (
            this.position >=
            this.source.length
        );

    }


    // ======================================
    // ADVANCE
    // ======================================

    advance() {

        if (this.isAtEnd()) {

            return "";

        }


        const ch =
            this.source[
                this.position
            ];


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


    // ======================================
    // DIGIT CHECK
    // ======================================

    isDigit(ch) {

        return (
            ch >= "0" &&
            ch <= "9"
        );

    }


    // ======================================
    // LETTER CHECK
    // ======================================

    isLetter(ch) {

        if (!ch) {

            return false;

        }


        return (

            (
                ch >= "a" &&
                ch <= "z"
            )

            ||

            (
                ch >= "A" &&
                ch <= "Z"
            )

            ||

            ch === "_"

        );

    }


    // ======================================
    // LETTER OR DIGIT
    // ======================================

    isLetterOrDigit(ch) {

        return (
            this.isLetter(ch) ||
            this.isDigit(ch)
        );

    }


    // ======================================
    // WHITESPACE + COMMENTS
    // ======================================

    skipWhitespaceAndComments() {

        while (!this.isAtEnd()) {

            const ch = this.peek();


            // ------------------------------
            // Whitespace
            // ------------------------------

            if (

                ch === " " ||

                ch === "\t" ||

                ch === "\r" ||

                ch === "\n"

            ) {

                this.advance();

                continue;

            }


            // ------------------------------
            // Single line comment
            // ------------------------------

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


            // ------------------------------
            // Multi line comment
            // ------------------------------

            if (

                ch === "/" &&

                this.peek(1) === "*"

            ) {

                const startLine =
                    this.line;

                const startColumn =
                    this.column;


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


                if (this.isAtEnd()) {

                    this.errors.push({

                        message:
                            "Unterminated comment",

                        line:
                            startLine,

                        column:
                            startColumn

                    });

                }


                continue;

            }


            break;

        }

    }


    // ======================================
    // SCAN NUMBER
    // ======================================

    scanNumber() {

        const start =
            this.position;

        let isFloat = false;


        // Integer part

        while (

            !this.isAtEnd() &&

            this.isDigit(
                this.peek()
            )

        ) {

            this.advance();

        }


        // Decimal part

        if (

            this.peek() === "." &&

            this.isDigit(
                this.peek(1)
            )

        ) {

            isFloat = true;

            this.advance();


            while (

                !this.isAtEnd() &&

                this.isDigit(
                    this.peek()
                )

            ) {

                this.advance();

            }

        }


        const value =
            this.source.slice(
                start,
                this.position
            );


        return {

            type:
                isFloat
                    ? TokenType.FLOAT
                    : TokenType.INTEGER,

            tokenName:
                isFloat
                    ? TokenType.FLOAT
                    : TokenType.INTEGER,

            value

        };

    }


    // ======================================
    // SCAN IDENTIFIER / KEYWORD
    // ======================================

    scanIdentifier() {

        const start =
            this.position;


        while (

            !this.isAtEnd() &&

            this.isLetterOrDigit(
                this.peek()
            )

        ) {

            this.advance();

        }


        const text =
            this.source.slice(
                start,
                this.position
            );


        // Keyword

        if (
            KEYWORDS.includes(text)
        ) {

            return {

                type:
                    TokenType.KEYWORD,

                tokenName:
                    TokenType.KEYWORD,

                value:
                    text

            };

        }


        // Identifier

        return {

            type:
                TokenType.IDENTIFIER,

            tokenName:
                TokenType.IDENTIFIER,

            value:
                text

        };

    }


    // ======================================
    // SCAN STRING
    // ======================================

    scanString() {

        const startLine =
            this.line;

        const startColumn =
            this.column;


        // Opening "

        this.advance();


        let value = "";


        while (

            !this.isAtEnd() &&

            this.peek() !== '"'

        ) {

            const ch =
                this.advance();


            // Basic escape handling

            if (
                ch === "\\" &&
                !this.isAtEnd()
            ) {

                const next =
                    this.peek();


                if (
                    next === "n"
                ) {

                    value += "\n";

                    this.advance();

                }

                else if (
                    next === "t"
                ) {

                    value += "\t";

                    this.advance();

                }

                else if (
                    next === '"'
                ) {

                    value += '"';

                    this.advance();

                }

                else if (
                    next === "\\"
                ) {

                    value += "\\";

                    this.advance();

                }

                else {

                    value += ch;

                }

            }

            else {

                value += ch;

            }

        }


        // Unterminated string

        if (this.isAtEnd()) {

            this.errors.push({

                message:
                    "Unterminated string",

                line:
                    startLine,

                column:
                    startColumn

            });


            return null;

        }


        // Closing "

        this.advance();


        return {

            type:
                TokenType.STRING,

            tokenName:
                TokenType.STRING,

            value

        };

    }


    // ======================================
    // MATCH OPERATOR
    // ======================================

    matchOperator() {

        // Longest match first

        for (
            const op of OPERATORS
        ) {

            if (

                this.source.startsWith(
                    op,
                    this.position
                )

            ) {

                this.position +=
                    op.length;

                this.column +=
                    op.length;


                return {

                    type:
                        TokenType.OPERATOR,

                    tokenName:
                        TokenType.OPERATOR,

                    value:
                        op

                };

            }

        }


        return null;

    }


    // ======================================
    // MAIN TOKENIZE
    // ======================================

    tokenize() {

        while (
            !this.isAtEnd()
        ) {


            // ------------------------------
            // Skip whitespace/comments
            // ------------------------------

            this.skipWhitespaceAndComments();


            if (
                this.isAtEnd()
            ) {

                break;

            }


            const startLine =
                this.line;

            const startColumn =
                this.column;


            const ch =
                this.peek();


            let token = null;


            // ------------------------------
            // NUMBER
            // ------------------------------

            if (
                this.isDigit(ch)
            ) {

                token =
                    this.scanNumber();

            }


            // ------------------------------
            // IDENTIFIER / KEYWORD
            // ------------------------------

            else if (
                this.isLetter(ch)
            ) {

                token =
                    this.scanIdentifier();

            }


            // ------------------------------
            // STRING
            // ------------------------------

            else if (
                ch === '"'
            ) {

                token =
                    this.scanString();

            }


            // ------------------------------
            // OPERATOR
            // ------------------------------

            else {

                token =
                    this.matchOperator();


                // --------------------------
                // PUNCTUATION
                // --------------------------

                if (
                    !token &&
                    PUNCTUATION[ch]
                ) {

                    this.advance();


                    token = {

                        type:
                            PUNCTUATION[ch],

                        tokenName:
                            PUNCTUATION[ch],

                        value:
                            ch

                    };

                }

            }


            // ------------------------------
            // INVALID CHARACTER
            // ------------------------------

            if (!token) {

                this.errors.push({

                    message:
                        `Invalid Character '${ch}'`,

                    line:
                        startLine,

                    column:
                        startColumn

                });


                this.advance();

                continue;

            }


            // Add location

            token.line =
                startLine;

            token.column =
                startColumn;


            this.tokens.push(
                token
            );

        }


        this.tokens.push({

            type:
                TokenType.EOF,

            tokenName:
                TokenType.EOF,

            value:
                "EOF",

            line:
                this.line,

            column:
                this.column

        });


        return {

            tokens:
                this.tokens,

            errors:
                this.errors

        };

    }

}

function tokenizeC(source) {

    const lexer =
        new Lexer(source);

    return lexer.tokenize();

}

module.exports = {

    tokenizeC,

    TokenType

};