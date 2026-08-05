const { TokenType } = require("./lexer");

class Parser {

    constructor(tokens) {

        this.tokens = tokens;
        this.current = 0;
        this.errors = [];

    }

    // ==========================
    // BASIC
    // ==========================

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

        if (token.type !== type)
            return false;

        if (
            value !== null &&
            token.value !== value
        )
            return false;

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

        const token = this.peek();

        this.errors.push({

            message,

            line: token ? token.line : 0,

            column: token ? token.column : 0

        });

        return null;

    }

    // ==========================
    // ENTRY
    // ==========================

    parse() {

        return {

            ast: this.parseProgram(),

            errors: this.errors

        };

    }

    // ==========================
    // PROGRAM
    // ==========================

    parseProgram() {

        const body = [];

        while (!this.isAtEnd()) {

            if (
                this.check(TokenType.KEYWORD, "include")
            ) {

                body.push(
                    this.parseInclude()
                );

                continue;

            }

            if (
                this.check(TokenType.KEYWORD, "using")
            ) {

                body.push(
                    this.parseUsingNamespace()
                );

                continue;

            }

            body.push(
                this.parseFunction()
            );

        }
        console.log("===== PROGRAM BODY =====");

body.forEach(node => {
    console.log(node.type);
});

        return {

            type: "Program",

            body

        };

    }

    // ==========================
    // INCLUDE
    // ==========================

    parseInclude() {

        this.consume(
            TokenType.KEYWORD,
            "include",
            "Expected include"
        );

        const header = this.consume(
            TokenType.HEADER,
            null,
            "Expected header file"
        );

        return {

            type: "IncludeStatement",

            header:
                header
                    ? header.value
                    : ""

        };

    }

    // ==========================
    // USING NAMESPACE
    // ==========================

    parseUsingNamespace() {

        this.consume(
            TokenType.KEYWORD,
            "using",
            "Expected using"
        );

        this.consume(
            TokenType.KEYWORD,
            "namespace",
            "Expected namespace"
        );

        const name = this.consume(
            TokenType.KEYWORD,
            "std",
            "Expected std"
        );

        this.consume(
            TokenType.SEMICOLON,
            null,
            "Missing ';'"
        );

        return {

            type: "UsingNamespace",

            name:
                name
                    ? name.value
                    : ""

        };

    }
// ==========================
// FUNCTION
// ==========================

parseFunction() {

    const returnType = this.consume(
        TokenType.KEYWORD,
        null,
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
        "Expected '('"
    );

    const params = [];

    if (!this.check(TokenType.RPAREN)) {

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

                dataType:
                    dataType
                        ? dataType.value
                        : "",

                name:
                    identifier
                        ? identifier.value
                        : ""

            });

        }

        while (this.match(TokenType.COMMA));

    }

    this.consume(
        TokenType.RPAREN,
        null,
        "Expected ')'"
    );

    const body = this.parseBlock();

    return {

        type:
            name &&
            name.value === "main"
                ? "MainFunction"
                : "FunctionDeclaration",

        name:
            name
                ? name.value
                : "",

        returnType:
            returnType
                ? returnType.value
                : "void",

        params,

        body

    };

}



// ==========================
// BLOCK
// ==========================

parseBlock() {

    this.consume(
        TokenType.LBRACE,
        null,
        "Expected '{'"
    );

    const body = [];

    while (

        !this.check(TokenType.RBRACE) &&
        !this.isAtEnd()

    ) {

        const stmt =
            this.parseStatement();

        if (stmt) {

            body.push(stmt);

        }

    }

    this.consume(
        TokenType.RBRACE,
        null,
        "Expected '}'"
    );

    return {

        type: "Block",

        body

    };

}

// ==========================
// STATEMENT
// ==========================

parseStatement() {

    const token = this.peek();

    if (!token) {

        return null;

    }

    // Variable Declaration

    if (

        token.type === TokenType.KEYWORD &&

        [

            "int",

            "float",

            "double",

            "char",

            "bool"

        ].includes(token.value)

    ) {

        return this.parseVariableDeclaration();

    }

    // Return

    if (

        token.type === TokenType.KEYWORD &&

        token.value === "return"

    ) {

        return this.parseReturn();

    }

    // if

    if (

        token.type === TokenType.KEYWORD &&

        token.value === "if"

    ) {

        return this.parseIf();

    }

    // while

    if (

        token.type === TokenType.KEYWORD &&

        token.value === "while"

    ) {

        return this.parseWhile();

    }

    // for

    if (

        token.type === TokenType.KEYWORD &&

        token.value === "for"

    ) {

        return this.parseFor();

    }

    // cout

    if (

        token.type === TokenType.KEYWORD &&

        token.value === "cout"

    ) {

        return this.parseCout();

    }

    // cin

    if (

        token.type === TokenType.KEYWORD &&

        token.value === "cin"

    ) {

        return this.parseCin();

    }

    // Assignment অথবা Function Call

    if (

        token.type === TokenType.IDENTIFIER

    ) {

        if (

            this.tokens[this.current + 1] &&

            this.tokens[this.current + 1].type === TokenType.LPAREN

        ) {

            return this.parseFunctionCallStatement();

        }

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
// ==========================================
// VARIABLE DECLARATION
// ==========================================

parseVariableDeclaration() {

    const dataType = this.advance().value;

    const identifier = this.consume(
        TokenType.IDENTIFIER,
        null,
        "Expected variable name"
    );

    let value = null;

    if (this.match(TokenType.OPERATOR, "=")) {

        value = this.parseExpression();

    }

    this.consume(
        TokenType.SEMICOLON,
        null,
        "Expected ';'"
    );

    return {

        type: "VariableDeclaration",

        dataType,

        identifier: identifier.value,

        value

    };

}
parseVariableDeclarationWithoutSemicolon() {

    const dataType = this.advance().value;

    const identifier = this.consume(
        TokenType.IDENTIFIER,
        null,
        "Expected variable name"
    );

    let value = null;

    if (this.match(TokenType.OPERATOR, "=")) {

        value = this.parseExpression();

    }

    return {

        type: "VariableDeclaration",

        dataType,

        identifier: identifier.value,

        value

    };

}
// ==========================================
// ASSIGNMENT
// ==========================================
parseAssignment() { 
    const stmt = this.parseAssignmentWithoutSemicolon(); 
    this.consume(
         TokenType.SEMICOLON,
          null,
           "Expected ';'"

 ); 
    return stmt; 
}

parseUpdateExpression() {

    const identifier = this.consume(
        TokenType.IDENTIFIER,
        null,
        "Expected identifier"
    );

    const op = this.advance();

    return {

        type: "UpdateExpression",

        identifier: identifier.value,

        operator: op.value

    };

}
// ==========================================
// RETURN
// ==========================================

parseReturn() {

    this.consume(
        TokenType.KEYWORD,
        "return",
        "Expected return"
    );

    let value = null;

    if (!this.check(TokenType.SEMICOLON)) {

        value = this.parseExpression();

    }

    this.consume(
        TokenType.SEMICOLON,
        null,
        "Expected ';'"
    );

    return {

        type: "ReturnStatement",

        value

    };

}

// ==========================================
// FUNCTION CALL STATEMENT
// ==========================================

parseFunctionCallStatement() {

    const expr = this.parseFunctionCall();

    this.consume(
        TokenType.SEMICOLON,
        null,
        "Expected ';'"
    );

    return {

        type: "ExpressionStatement",

        expression: expr

    };

}
parseFunctionCall() {

    const name = this.consume(
        TokenType.IDENTIFIER,
        null,
        "Expected function name"
    );

    this.consume(
        TokenType.LPAREN,
        null,
        "Expected ("
    );

    const args = [];

    if (!this.check(TokenType.RPAREN)) {

        do {

            args.push(
                this.parseExpression()
            );

        }

        while(this.match(TokenType.COMMA));

    }

    this.consume(
        TokenType.RPAREN,
        null,
        "Expected )"
    );

    return {

        type:"CallExpression",

        name:name.value,

        arguments:args

    };

}



// ======================================
// EXPRESSION
// ======================================

parseExpression() {

    return this.parseLogicalOr();

}


// ======================================
// LOGICAL OR
// ======================================

parseLogicalOr() {

    let left = this.parseLogicalAnd();

    while (this.match(TokenType.OPERATOR, "||")) {

        left = {

            type: "BinaryExpression",

            operator: "||",

            left,

            right: this.parseLogicalAnd()

        };

    }

    return left;

}


// ======================================
// LOGICAL AND
// ======================================

parseLogicalAnd() {

    let left = this.parseEquality();

    while (this.match(TokenType.OPERATOR, "&&")) {

        left = {

            type: "BinaryExpression",

            operator: "&&",

            left,

            right: this.parseEquality()

        };

    }

    return left;

}


// ======================================
// EQUALITY
// ======================================

parseEquality() {

    let left = this.parseComparison();

    while (

        this.check(TokenType.OPERATOR, "==") ||

        this.check(TokenType.OPERATOR, "!=")

    ) {

        const op = this.advance().value;

        left = {

            type: "BinaryExpression",

            operator: op,

            left,

            right: this.parseComparison()

        };

    }

    return left;

}


// ======================================
// COMPARISON
// ======================================

parseComparison() {

    let left = this.parseAddition();

    while (

        this.check(TokenType.OPERATOR, "<") ||

        this.check(TokenType.OPERATOR, ">") ||

        this.check(TokenType.OPERATOR, "<=") ||

        this.check(TokenType.OPERATOR, ">=")

    ) {

        const op = this.advance().value;

        left = {

            type: "BinaryExpression",

            operator: op,

            left,

            right: this.parseAddition()

        };

    }

    return left;

}
// ======================================
// ADDITION / SUBTRACTION
// ======================================

parseAddition() {

    let left = this.parseMultiplication();

    while (

        this.check(TokenType.OPERATOR, "+") ||

        this.check(TokenType.OPERATOR, "-")

    ) {

        const op = this.advance().value;

        left = {

            type: "BinaryExpression",

            operator: op,

            left,

            right: this.parseMultiplication()

        };

    }

    return left;

}


// ======================================
// MULTIPLICATION / DIVISION
// ======================================

parseMultiplication() {

    let left = this.parsePrimary();

    while (

        this.check(TokenType.OPERATOR, "*") ||

        this.check(TokenType.OPERATOR, "/") ||

        this.check(TokenType.OPERATOR, "%")

    ) {

        const op = this.advance().value;

        left = {

            type: "BinaryExpression",

            operator: op,

            left,

            right: this.parsePrimary()

        };

    }

    return left;

}
parseIf() {

    this.consume(
        TokenType.KEYWORD,
        "if",
        "Expected if"
    );

    this.consume(
        TokenType.LPAREN,
        null,
        "Expected '('"
    );

    const condition = this.parseExpression();

    this.consume(
        TokenType.RPAREN,
        null,
        "Expected ')'"
    );

    const thenBranch = this.parseBlock();

    let elseBranch = null;

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

    this.consume(
        TokenType.KEYWORD,
        "while",
        "Expected while"
    );

    this.consume(
        TokenType.LPAREN,
        null,
        "Expected '('"
    );

    const condition = this.parseExpression();

    this.consume(
        TokenType.RPAREN,
        null,
        "Expected ')'"
    );

    const body = this.parseBlock();

    return {

        type: "WhileStatement",

        condition,

        body

    };

}

parseFor() {

    this.consume(
        TokenType.KEYWORD,
        "for",
        "Expected for"
    );

    this.consume(
        TokenType.LPAREN,
        null,
        "Expected '('"
    );

     // Initialization

   // Initialization

let initialization = null;

if (!this.check(TokenType.SEMICOLON)) {

    if (this.check(TokenType.KEYWORD)) {

        initialization =
            this.parseVariableDeclarationWithoutSemicolon();

    }

    else {

        initialization =
            this.parseAssignmentWithoutSemicolon();

    }

}

this.consume(
    TokenType.SEMICOLON,
    null,
    "Expected ';'"
);

    // Condition

    let condition = null;

    if (!this.check(TokenType.SEMICOLON)) {

        condition = this.parseExpression();

    }

    this.consume(
        TokenType.SEMICOLON,
        null,
        "Expected ';'"
    );

    // Update

    let update = null;

    if (!this.check(TokenType.RPAREN)) {

        update = this.parseUpdateExpression();

    }

    this.consume(
        TokenType.RPAREN,
        null,
        "Expected ')'"
    );

    const body = this.parseBlock();

    return {

        type: "ForStatement",

        initialization,

        condition,

        update,

        body

    };

}
parseCin() {

    this.consume(
        TokenType.KEYWORD,
        "cin",
        "Expected cin"
    );

    const variables = [];

    do {

        this.consume(
            TokenType.OPERATOR,
            ">>",
            "Expected >>"
        );

        const id = this.consume(
            TokenType.IDENTIFIER,
            null,
            "Expected variable"
        );

        variables.push(id.value);

    }

    while (this.check(TokenType.OPERATOR, ">>"));

    this.consume(
        TokenType.SEMICOLON,
        null,
        "Expected ';'"
    );

    return {

        type: "CinStatement",

        variables

    };

}
parseCout() {

    this.consume(
        TokenType.KEYWORD,
        "cout",
        "Expected cout"
    );

    const values = [];

  while (this.match(TokenType.OPERATOR, "<<")) {

        if (
            this.check(TokenType.KEYWORD, "endl")
        ) {

            this.advance();

            values.push({

                type: "Endl"

            });

        }

        else {

            values.push(

                this.parseExpression()

            );

        }

    }

    this.consume(

        TokenType.SEMICOLON,

        null,

        "Expected ';'"

    );

    return {

        type: "CoutStatement",

        values

    };

}

    

// ======================================
// PRIMARY
// ======================================

parsePrimary() {

    const token = this.peek();

    if (!token) {

        return null;

    }

    // Integer

    if (token.type === TokenType.INTEGER) {

        this.advance();

        return {

            type: "Literal",

            value: Number(token.value)

        };

    }

    // Float

    if (token.type === TokenType.FLOAT) {

        this.advance();

        return {

            type: "Literal",

            value: Number(token.value)

        };

    }

    // String

    if (token.type === TokenType.STRING) {

        this.advance();

        return {

            type: "Literal",

            value: token.value

        };

    }

    // Identifier / Function Call

    if (token.type === TokenType.IDENTIFIER) {

        this.advance();

        if (this.match(TokenType.LPAREN)) {

            const args = [];

            if (!this.check(TokenType.RPAREN)) {

                do {

                    args.push(this.parseExpression());

                }

                while (this.match(TokenType.COMMA));

            }

            this.consume(

                TokenType.RPAREN,

                null,

                "Expected ')'"

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

    // ( expression )

    if (this.match(TokenType.LPAREN)) {

        const expr = this.parseExpression();

        this.consume(

            TokenType.RPAREN,

            null,

            "Expected ')'"

        );

        return expr;

    }

    this.errors.push({

        message: "Invalid expression",

        line: token.line,

        column: token.column

    });

    this.advance();

    return null;

}

} // End Parser Class


// ======================================
// EXPORT
// ======================================

function parseCPP(tokens) {

    const parser = new Parser(tokens);

    return parser.parse();

}

module.exports = {

    Parser,

    parseCPP

};
