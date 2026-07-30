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
        TokenType.PUNCTUATION,
        "(",
        "Expected '(' after 'if'"
    );

    // Parse condition
    const condition = this.parseExpression();

    // Consume ")"
    this.consume(
        TokenType.PUNCTUATION,
        ")",
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

    // Consume "("
    this.consume(
        TokenType.PUNCTUATION,
        "(",
        "Expected '(' after 'while'"
    );

    // Parse condition
    const condition = this.parseExpression();

    // Consume ")"
    this.consume(
        TokenType.PUNCTUATION,
        ")",
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
        TokenType.PUNCTUATION,
        ";",
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

    // Number
    if (token.type === TokenType.NUMBER) {

        this.advance();

        return {

            type: "Literal",

            value: token.value

        };

    }

    // Boolean true
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

    // Boolean false
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

    // Identifier
    if (token.type === TokenType.IDENTIFIER) {

        this.advance();

        return {

            type: "Identifier",

            name: token.value

        };

    }

    // Parenthesized expression
    if (this.match(TokenType.PUNCTUATION, "(")) {

        const expression = this.parseExpression();

        this.consume(
            TokenType.PUNCTUATION,
            ")",
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
