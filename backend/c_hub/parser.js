const { TokenType } = require("./lexer");

class Parser {

    constructor(tokens) {

        this.tokens = tokens;
        this.current = 0;
        this.errors = [];

    }

    peek() {

        return this.tokens[this.current];

    }

    previous() {

        return this.tokens[this.current - 1];

    }

    isAtEnd() {

        return this.peek().type === TokenType.EOF;

    }

    advance() {

        if (!this.isAtEnd()) {

            this.current++;

        }

        return this.previous();

    }

    check(type, value = null) {

        if (this.isAtEnd()) return false;

        const token = this.peek();

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

    consume(type, value, message) {

        if (this.check(type, value)) {

            return this.advance();

        }

        this.errors.push({

            message,

            line: this.peek().line,
            column: this.peek().column

        });

        return null;

    }
    parse() {

        const ast = this.parseProgram();

        return {

            ast,
            errors: this.errors

        };

    }
        parseProgram() {

        const body = [];

        while (!this.isAtEnd()) {

            body.push(this.parseFunction());

        }

        return {

            type: "Program",

            body

        };

    }
        parseFunction() {

        this.consume(
            TokenType.KEYWORD,
            "int",
            "Expected return type"
        );

        const name = this.advance();

        if (name.value !== "main") {

            this.errors.push({

                message: "Expected main function",

                line: name.line,

                column: name.column

            });

        }

        this.consume(
            TokenType.PUNCTUATION,
            "(",
            "Expected ("
        );

        this.consume(
            TokenType.PUNCTUATION,
            ")",
            "Expected )"
        );

        const body = this.parseBlock();

        return {

            type: "MainFunction",

            name: "main",

            body

        };

    }
        parseBlock() {

        this.consume(

            TokenType.PUNCTUATION,

            "{",

            "Expected {"

        );

        const statements = [];

        while (

            !this.check(TokenType.PUNCTUATION, "}") &&
            !this.isAtEnd()

        ) {

            statements.push(

                this.parseStatement()

            );

        }

        this.consume(

            TokenType.PUNCTUATION,

            "}",

            "Expected }"

        );

        return {

            type: "Block",

            body: statements

        };

    }
    

parseStatement() {

    const token = this.peek();

    if (
        token.type === TokenType.KEYWORD &&
        (
            token.value === "int" ||
            token.value === "float" ||
            token.value === "bool"
        )
    ) {

        return this.parseVariableDeclaration();

    }

    if (token.type === TokenType.IDENTIFIER) {

        return this.parseAssignment();

    }

    if (
        token.type === TokenType.KEYWORD &&
        token.value === "return"
    ) {

        return this.parseReturn();

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

    const identifier = this.consume(

        TokenType.IDENTIFIER,

        null,

        "Variable Name Expected"

    );

    let value = null;

    if (this.match(TokenType.OPERATOR, "=")) {

        value = this.parseExpression();

    }

    this.consume(

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

    this.consume(

        TokenType.OPERATOR,

        "=",

        "Expected '='"

    );

    const value = this.parseExpression();

    this.consume(

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
parseReturn() {

    this.advance();

    const value = this.parseExpression();

    this.consume(

        TokenType.PUNCTUATION,

        ";",

        "Missing ';'"

    );

    return {

        type: "ReturnStatement",

        value

  };
}
 }

function parseC(tokens) {

    const parser = new Parser(tokens);

    return parser.parse();

}

module.exports = {

    parseC

};
