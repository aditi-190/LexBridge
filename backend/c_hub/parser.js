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

    const token = this.peek();

    if (!token) return false;

    if (token.type !== type) return false;

    if (value !== null && token.value !== value) {
        return false;
    }

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

    const returnType = this.consume(
        TokenType.KEYWORD,
        "int",
        "Expected return type"
    );

    const name = this.consume(
        TokenType.IDENTIFIER,
        null,
        "Expected function name"
    );

    this.consume(
        TokenType.LPAREN,
        null,
        "Expected '(' after function name"
    );

    const params = [];

    if (!this.check(TokenType.RPAREN, null)) {

        do {

            const dataType = this.consume(
                TokenType.KEYWORD,
                null,
                "Expected parameter type"
            );

            const identifier = this.consume(
                TokenType.IDENTIFIER,
                null,
                "Expected parameter name"
            );

            params.push({

                type: "Parameter",

                dataType: dataType
                    ? dataType.value
                    : "",

                name: identifier
                    ? identifier.value
                    : ""

            });

        } while (
            this.match(
                TokenType.COMMA,
                null
            )
        );

    }

    this.consume(
        TokenType.RPAREN,
        null,
        "Expected ')'"
    );

    const body = this.parseBlock();

    return {

        type:
            name && name.value === "main"
                ? "MainFunction"
                : "FunctionDeclaration",

        name:
            name
                ? name.value
                : "",

        returnType:
            returnType
                ? returnType.value
                : "int",

        params,

        body

    };

}
        parseBlock() {

        this.consume(
    TokenType.LBRACE,
    null,
    "Expected '{'"
   );
        

        const statements = [];

   while (
    !this.check(TokenType.RBRACE, null) &&
    !this.isAtEnd()
) {

            statements.push(

                this.parseStatement()

            );

        }

      this.consume(
    TokenType.RBRACE,
    null,
    "Expected '}'"
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
    if (token.type === TokenType.KEYWORD && token.value === "if") {
    return this.parseIf();
}

if (token.type === TokenType.KEYWORD && token.value === "while") {
    return this.parseWhile();
}

if (token.type === TokenType.KEYWORD && token.value === "print") {
    return this.parsePrint();
}

    this.errors.push({

        message: "Invalid Statement",

        line: token.line,
        column: token.column

    });

    this.advance();

    return null;

}
parseIf() {

    // Consume "if"
    this.consume(
        TokenType.KEYWORD,
        "if",
        "Expected 'if'"
    );

    // Consume "("
   this.consume(
    TokenType.LPAREN,
    null,
    "Expected '(' after 'if'"
);
    // Parse condition
    const condition = this.parseExpression();

    // Consume ")"
   this.consume(
    TokenType.RPAREN,
    null,
    "Expected ')' after condition"
);

    // Parse if body
    const thenBranch = this.parseBlock();

    let elseBranch = null;

    // Check for else
    if (this.match(TokenType.KEYWORD, "else")) {

        elseBranch = this.parseBlock();

    }

    return {

        type: "IfStatement",

        condition,

        thenBranch,

        elseBranch

    };

}
parseWhile() {

    // Consume "while"
    this.consume(
        TokenType.KEYWORD,
        "while",
        "Expected 'while'"
    );
this.consume(
    TokenType.LPAREN,
    null,
    "Expected '(' after 'while'"
);

const condition = this.parseExpression();

this.consume(
    TokenType.RPAREN,
    null,
    "Expected ')' after condition"
);
   
    // Parse loop body
    const body = this.parseBlock();

    return {

        type: "WhileStatement",

        condition,

        body

    };

}
parsePrint() {

    // Consume "print"
    this.consume(
        TokenType.KEYWORD,
        "print",
        "Expected 'print'"
    );

    // Parse value/expression
    const value = this.parseExpression();

    // Consume ";"
    this.consume(
    TokenType.SEMICOLON,
    null,
    "Missing ';' after print"
);

    return {

        type: "PrintStatement",

        value

    };

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
    TokenType.SEMICOLON,
    null,
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
        TokenType.SEMICOLON,
        null,
        "Missing ';'"
    );

    return {

        type: "Assignment",

        identifier,

        value

    };

}
parseExpression() {

    return this.parseLogicalOr();

}

// Logical OR: ||
parseLogicalOr() {

    let left = this.parseLogicalAnd();

    while (this.check(TokenType.OPERATOR, "||")) {

        const operator = this.advance().value;

        const right = this.parseLogicalAnd();

        left = {

            type: "BinaryExpression",

            operator,

            left,

            right

        };

    }

    return left;

}

// Logical AND: &&
parseLogicalAnd() {

    let left = this.parseEquality();

    while (this.check(TokenType.OPERATOR, "&&")) {

        const operator = this.advance().value;

        const right = this.parseEquality();

        left = {

            type: "BinaryExpression",

            operator,

            left,

            right

        };

    }

    return left;

}

// Equality: == !=
parseEquality() {

    let left = this.parseComparison();

    while (
        this.check(TokenType.OPERATOR, "==") ||
        this.check(TokenType.OPERATOR, "!=")
    ) {

        const operator = this.advance().value;

        const right = this.parseComparison();

        left = {

            type: "BinaryExpression",

            operator,

            left,

            right

        };

    }

    return left;

}

// Relational: < > <= >=
parseComparison() {

    let left = this.parseAddition();

    while (
        this.check(TokenType.OPERATOR, "<") ||
        this.check(TokenType.OPERATOR, ">") ||
        this.check(TokenType.OPERATOR, "<=") ||
        this.check(TokenType.OPERATOR, ">=")
    ) {

        const operator = this.advance().value;

        const right = this.parseAddition();

        left = {

            type: "BinaryExpression",

            operator,

            left,

            right

        };

    }

    return left;

}

// Arithmetic: + -
parseAddition() {

    let left = this.parseMultiplication();

    while (
        this.check(TokenType.OPERATOR, "+") ||
        this.check(TokenType.OPERATOR, "-")
    ) {

        const operator = this.advance().value;

        const right = this.parseMultiplication();

        left = {

            type: "BinaryExpression",

            operator,

            left,

            right

        };

    }

    return left;

}

// Arithmetic: * / %
parseMultiplication() {

    let left = this.parseUnary();

    while (
        this.check(TokenType.OPERATOR, "*") ||
        this.check(TokenType.OPERATOR, "/") ||
        this.check(TokenType.OPERATOR, "%")
    ) {

        const operator = this.advance().value;

        const right = this.parseUnary();

        left = {

            type: "BinaryExpression",

            operator,

            left,

            right

        };

    }

    return left;

}

// Unary: !
parseUnary() {

    if (this.match(TokenType.OPERATOR, "!")) {

        const operand = this.parseUnary();

        return {

            type: "UnaryExpression",

            operator: "!",

            operand

        };

    }

    return this.parsePrimary();

}

// Primary expressions
parsePrimary() {

    const token = this.peek();

    if (
        token.type === TokenType.INTEGER ||
        token.type === TokenType.FLOAT
    ) {

        this.advance();

        return {

            type: "Literal",

            value: Number(token.value)

        };

    }

    if (token.type === TokenType.STRING) {

        this.advance();

        return {

            type: "Literal",

            value: token.value

        };

    }
    if (
        token.type === TokenType.KEYWORD &&
        token.value === "true"
    ) {

        this.advance();

        return {

            type: "Literal",

            value: true

        };

    }

    if (
        token.type === TokenType.KEYWORD &&
        token.value === "false"
    ) {

        this.advance();

        return {

            type: "Literal",

            value: false

        };

    }

    if (token.type === TokenType.IDENTIFIER) {

        this.advance();

        if (this.match(TokenType.LPAREN, null)) {

            const args = [];


            // No arguments
            if (!this.check(TokenType.RPAREN, null)) {

                do {

                    args.push(
                        this.parseExpression()
                    );

                } while (
                    this.match(
                        TokenType.COMMA,
                        null
                    )
                );

            }


            this.consume(
                TokenType.RPAREN,
                null,
                "Expected ')' after arguments"
            );


            return {

                type: "CallExpression",

                name: token.value,

                arguments: args

            };

        }

        return {

            type: "Identifier",

            name: token.value

        };

    }

    if (this.match(TokenType.LPAREN, null)) {

        const expression =
            this.parseExpression();

        this.consume(
            TokenType.RPAREN,
            null,
            "Expected ')'"
        );

        return expression;

    }

    this.errors.push({

        message: "Invalid Expression",

        line: token.line,

        column: token.column

    });

    this.advance();

    return null;

}
parseReturn() {

    this.advance();

    const value = this.parseExpression();

   this.consume(
    TokenType.SEMICOLON,
    null,
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
