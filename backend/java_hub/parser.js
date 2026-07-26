const { TokenType } = require("./lexer");

class Parser {

    constructor(tokens) {

        this.tokens = tokens;
        this.position = 0;
        this.errors = [];

    }
    current() {

        return this.tokens[this.position];

    }

    peek(offset = 1) {

        return this.tokens[this.position + offset];

    }

    isAtEnd() {

        return this.current().type === TokenType.EOF;

    }

    advance() {

        if (!this.isAtEnd()) {

            this.position++;

        }

        return this.tokens[this.position - 1];

    }

    check(type, value = null) {

        const token = this.current();

        if (!token) return false;

        if (token.type !== type) return false;

        if (value !== null && token.value !== value) return false;

        return true;

    }

    match(type, value = null) {

        if (this.check(type, value)) {

            this.advance();

            return true;

        }

        return false;

    }

    expect(type, value = null, message = "Unexpected Token") {

        const token = this.current();

        if (this.check(type, value)) {

            return this.advance();

        }

        this.errors.push({

            message,

            line: token.line,
            column: token.column

        });

        return null;

    }
    parseProgram() {

        this.expect(
            TokenType.KEYWORD,
            "public",
            "Expected 'public'"
        );

        this.expect(
            TokenType.KEYWORD,
            "class",
            "Expected 'class'"
        );

        const className = this.expect(
            TokenType.IDENTIFIER,
            null,
            "Class Name Expected"
        );

        this.expect(
            TokenType.PUNCTUATION,
            "{",
            "Expected '{'"
        );

        const body = [];

        while (
            !this.isAtEnd() &&
            !this.check(TokenType.PUNCTUATION, "}")
        ) {

            body.push(this.parseMainMethod());

        }

        this.expect(
            TokenType.PUNCTUATION,
            "}",
            "Expected '}'"
        );

        return {

            type: "Program",

            className: className ? className.value : "",

            body

        };

    }
    parseMainMethod() {

        this.expect(
            TokenType.KEYWORD,
            "public",
            "Expected 'public'"
        );

        this.expect(
            TokenType.KEYWORD,
            "static",
            "Expected 'static'"
        );

        this.expect(
            TokenType.KEYWORD,
            "void",
            "Expected 'void'"
        );

        this.expect(
            TokenType.KEYWORD,
            "main",
            "Expected 'main'"
        );

        this.expect(
            TokenType.PUNCTUATION,
            "(",
            "Expected '('"
        );

        this.expect(
            TokenType.KEYWORD,
            "String",
            "Expected 'String'"
        );

        this.expect(
            TokenType.PUNCTUATION,
            "[",
            "Expected '['"
        );

        this.expect(
            TokenType.PUNCTUATION,
            "]",
            "Expected ']'"
        );

        this.expect(
            TokenType.IDENTIFIER,
            null,
            "Parameter Name Expected"
        );

        this.expect(
            TokenType.PUNCTUATION,
            ")",
            "Expected ')'"
        );

        const body = this.parseBlock();

        return {

            type: "MainMethod",

            body

        };

    }
    parseBlock() {

        this.expect(
            TokenType.PUNCTUATION,
            "{",
            "Expected '{'"
        );

        const statements = [];

        while (
            !this.isAtEnd() &&
            !this.check(TokenType.PUNCTUATION, "}")
        ) {

            const stmt = this.parseStatement();

            if (stmt) {

                statements.push(stmt);

            }

        }

        this.expect(
            TokenType.PUNCTUATION,
            "}",
            "Expected '}'"
        );

        return {

            type: "Block",

            body: statements

        };

    }

    parseStatement() {

        const token = this.current();

        if (
            token.type === TokenType.KEYWORD &&
            ["int", "float", "double", "char", "boolean"].includes(token.value)
        ) {

            return this.parseVariableDeclaration();

        }

        if (token.type === TokenType.IDENTIFIER) {

            return this.parseAssignment();

        }

        this.errors.push({

            message: "Invalid Statement",

            line: token.line,

            column: token.column

        });

        this.advance();

        return null;

    }

    parseVariableDeclaration() {

        const dataType = this.advance().value;

        const identifier = this.expect(
            TokenType.IDENTIFIER,
            null,
            "Variable Name Expected"
        );

        let value = null;

        if (this.match(TokenType.OPERATOR, "=")) {

            value = this.parseExpression();

        }

        this.expect(
            TokenType.PUNCTUATION,
            ";",
            "Missing ';'"
        );

        return {

            type: "VariableDeclaration",

            dataType,

            identifier: identifier ? identifier.value : "",

            value

        };

    }

    parseAssignment() {

        const identifier = this.advance().value;

        this.expect(
            TokenType.OPERATOR,
            "=",
            "Expected '='"
        );

        const value = this.parseExpression();

        this.expect(
            TokenType.PUNCTUATION,
            ";",
            "Missing ';'"
        );

        return {

            type: "Assignment",

            identifier,

            value

        };

    }

    parseExpression() {

        let left = this.parsePrimary();

        while (
            this.check(TokenType.OPERATOR, "+") ||
            this.check(TokenType.OPERATOR, "-") ||
            this.check(TokenType.OPERATOR, "*") ||
            this.check(TokenType.OPERATOR, "/")
        ) {

            const operator = this.advance().value;

            const right = this.parsePrimary();

            left = {

                type: "BinaryExpression",

                operator,

                left,

                right

            };

        }

        return left;

    }

    parsePrimary() {

        const token = this.current();

        if (token.type === TokenType.NUMBER) {

            this.advance();

            return {

                type: "Literal",

                value: token.value

            };

        }

        if (token.type === TokenType.STRING) {

            this.advance();

            return {

                type: "Literal",

                value: token.value

            };

        }

        if (token.type === TokenType.IDENTIFIER) {

            this.advance();

            return {

                type: "Identifier",

                name: token.value

            };

        }

        this.errors.push({

            message: "Invalid Expression",

            line: token.line,

            column: token.column

        });

        this.advance();

        return null;

    }
    parse() {

        const ast = this.parseProgram();

        return {

            ast,

            errors: this.errors

        };

    }

} // End Parser Class

// =====================================
// Public Function
// =====================================

function parseJava(tokens) {

    const parser = new Parser(tokens);

    return parser.parse();

}

module.exports = {

    parseJava

};