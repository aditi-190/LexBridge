const { TokenType } = require("./lexer");

class Parser {

    constructor(tokens) {

        this.tokens = tokens;
        this.current = 0;
        this.errors = [];

    }


    // ==========================================
    // BASIC TOKEN HELPERS
    // ==========================================

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

        if (token.type !== type) {

            return false;

        }

        if (
            value !== null &&
            token.value !== value
        ) {

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

        const token = this.peek();

        this.errors.push({

            message,

            line: token ? token.line : 0,

            column: token ? token.column : 0

        });

        return null;

    }


    // ==========================================
    // PARSE
    // ==========================================

    parse() {

        const ast = this.parseProgram();

        return {

            ast,

            errors: this.errors

        };

    }


    // ==========================================
    // PROGRAM
    // ==========================================

    parseProgram() {

        const body = [];

        while (!this.isAtEnd()) {

            // #include <stdio.h>
            if (this.check(TokenType.HASH, "#")) {

                body.push(
                    this.parseInclude()
                );

                continue;

            }

            body.push(
                this.parseFunction()
            );

        }

        return {

            type: "Program",

            body

        };

    }


    // ==========================================
    // INCLUDE
    // ==========================================

    parseInclude() {

        this.consume(
            TokenType.HASH,
            "#",
            "Expected '#'"
        );


        this.consume(
            TokenType.KEYWORD,
            "include",
            "Expected 'include'"
        );


        this.consume(
            TokenType.OPERATOR,
            "<",
            "Expected '<' after include"
        );


        const headerParts = [];


        // Read everything until >
        while (
            !this.check(
                TokenType.OPERATOR,
                ">"
            ) &&
            !this.isAtEnd()
        ) {

            const token = this.advance();

            headerParts.push(
                token.value
            );

        }


        this.consume(
            TokenType.OPERATOR,
            ">",
            "Expected '>' after header"
        );


        return {

            type: "IncludeDirective",

            header:
                headerParts.join("")

        };

    }


    // ==========================================
    // FUNCTION
    // ==========================================

    parseFunction() {

        const returnTypeToken =
            this.consume(
                TokenType.KEYWORD,
                null,
                "Expected return type"
            );


        const returnType =
            returnTypeToken
                ? returnTypeToken.value
                : "int";


        const name =
            this.consume(
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


        if (
            !this.check(
                TokenType.RPAREN,
                null
            )
        ) {

            do {

                const dataType =
                    this.consume(
                        TokenType.KEYWORD,
                        null,
                        "Expected parameter type"
                    );


                const identifier =
                    this.consume(
                        TokenType.IDENTIFIER,
                        null,
                        "Expected parameter name"
                    );


                params.push({

                    type: "Parameter",

                    dataType:
                        dataType
                            ? dataType.value
                            : "int",

                    name:
                        identifier
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


        const body =
            this.parseBlock();


        if (
            name &&
            name.value === "main"
        ) {

            return {

                type: "MainFunction",

                name: "main",

                returnType,

                params,

                body

            };

        }


        return {

            type: "FunctionDeclaration",

            name:
                name
                    ? name.value
                    : "",

            returnType,

            params,

            body

        };

    }


    // ==========================================
    // BLOCK
    // ==========================================

    parseBlock() {

        this.consume(
            TokenType.LBRACE,
            null,
            "Expected '{'"
        );


        const statements = [];


        while (

            !this.check(
                TokenType.RBRACE,
                null
            ) &&

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


    // ==========================================
    // STATEMENT
    // ==========================================

    parseStatement() {

        const token =
            this.peek();


        if (!token) {

            return null;

        }
        // For Loop

if (

    token.type === TokenType.KEYWORD &&

    token.value === "for"

) {

    return this.parseFor();

}

// Do While

if (

    token.type === TokenType.KEYWORD &&

    token.value === "do"

) {

    return this.parseDoWhile();

}
// scanf

if (

    token.type === TokenType.KEYWORD &&

    token.value === "scanf"

) {

    return this.parseScanf();

}


        // Variable declaration

        if (

            token.type === TokenType.KEYWORD &&

            (
                token.value === "int" ||
                token.value === "float" ||
                token.value === "bool"||
                 token.value === "char"
            )

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


        // If

        if (

            token.type === TokenType.KEYWORD &&

            token.value === "if"

        ) {

            return this.parseIf();

        }


        // While

        if (

            token.type === TokenType.KEYWORD &&

            token.value === "while"

        ) {

            return this.parseWhile();

        }


        // Custom print

        if (

            token.type === TokenType.KEYWORD &&

            token.value === "print"

        ) {

            return this.parsePrint();

        }


        if (
            token.type === TokenType.IDENTIFIER
        ) {

            if (
                this.checkNext(
                    TokenType.LPAREN
                )
            ) {

                return this.parseCallStatement();

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
    // CHECK NEXT TOKEN
    // ==========================================

    checkNext(type, value = null) {

        const token =
            this.tokens[
                this.current + 1
            ];


        if (!token) {

            return false;

        }


        if (token.type !== type) {

            return false;

        }


        if (
            value !== null &&
            token.value !== value
        ) {

            return false;

        }


        return true;

    }


    // ==========================================
    // FUNCTION CALL STATEMENT
    // ==========================================

    parseCallStatement() {

        const expression =
            this.parseExpression();


        this.consume(
            TokenType.SEMICOLON,
            null,
            "Missing ';' after function call"
        );


        return expression;

    }


    // ==========================================
    // INCLUDE / PRINT
    // ==========================================

    parsePrint() {

        this.consume(
            TokenType.KEYWORD,
            "print",
            "Expected 'print'"
        );


        const value =
            this.parseExpression();


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

    // ==========================================
// SCANF
// ==========================================

parseScanf(){

    this.consume(
        TokenType.KEYWORD,
        "scanf",
        "Expected scanf"
    );


    this.consume(
        TokenType.LPAREN,
        null,
        "Expected '('"
    );


    const format = this.advance();


    const variables=[];


    if(this.match(TokenType.COMMA,null)){


        while(true){


            this.match(
                TokenType.OPERATOR,
                "&"
            );


            const variable =
                this.consume(
                    TokenType.IDENTIFIER,
                    null,
                    "Expected variable"
                );


            if(variable){
                variables.push(variable.value);
            }


            if(this.match(TokenType.COMMA,null)){
                continue;
            }

            break;

        }

    }


    this.consume(
        TokenType.RPAREN,
        null,
        "Expected ')'"
    );


    this.consume(
        TokenType.SEMICOLON,
        null,
        "Missing ';'"
    );


    return {

        type:"ScanfStatement",

        format: format.value,

        variables

    };


}

    // ==========================================
    // VARIABLE DECLARATION
    // ==========================================
parseVariableDeclaration() {

    const dataType =
        this.advance().value;


    const variables = [];


    do {

        const identifier =
            this.consume(
                TokenType.IDENTIFIER,
                null,
                "Variable Name Expected"
            );


        let isArray = false;

        let arraySize = null;


        // ==========================
        // Array support
        // char name[20]
        // char name[]
        // ==========================

        if(
            this.match(
                TokenType.LBRACKET,
                null
            )
        ){

            isArray = true;


            if(
                this.check(
                    TokenType.INTEGER,
                    null
                )
            ){

                arraySize =
                    Number(
                        this.advance().value
                    );

            }


            this.consume(
                TokenType.RBRACKET,
                null,
                "Expected ']'"
            );

        }



        let value = null;


        // ==========================
        // Initialization
        // int a = 10
        // char name = "Prome"
        // ==========================

        if(
            this.match(
                TokenType.OPERATOR,
                "="
            )
        ){

            value =
                this.parseExpression();

        }



        if(identifier){

            variables.push({

                name:
                    identifier.value,


                value,


                isArray,


                arraySize

            });

        }


    }
    while(
        this.match(
            TokenType.COMMA,
            null
        )
    );



    this.consume(
        TokenType.SEMICOLON,
        null,
        "Missing ';'"
    );



    return {

        type:
            "VariableDeclaration",


        dataType,


        variables

    };

}
    // ==========================================
    // ASSIGNMENT
    // ==========================================

    parseAssignment() {

        const identifier =
            this.advance().value;


        this.consume(
            TokenType.OPERATOR,
            "=",
            "Expected '='"
        );


        const value =
            this.parseExpression();


        if (
    this.check(
        TokenType.SEMICOLON,
        null
    )
) {

    this.advance();

}

        return {

            type: "Assignment",

            identifier,

            value

        };

    }


    // ==========================================
    // IF
    // ==========================================

   parseIf(){

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


    const condition =
        this.parseExpression();


    this.consume(
        TokenType.RPAREN,
        null,
        "Expected ')'"
    );


    let thenBranch;


    if(this.check(TokenType.LBRACE,null)){

        thenBranch=this.parseBlock();

    }
    else{

        thenBranch={
            type:"Block",
            body:[
                this.parseStatement()
            ]
        };

    }



    let elseBranch=null;


    if(
        this.match(
            TokenType.KEYWORD,
            "else"
        )
    ){


        if(this.check(TokenType.LBRACE,null)){

            elseBranch=this.parseBlock();

        }
        else{

            elseBranch={
                type:"Block",
                body:[
                    this.parseStatement()
                ]
            };

        }

    }


    return {

        type:"IfStatement",

        condition,

        thenBranch,

        elseBranch

    };


}

    // ==========================================
    // WHILE
    // ==========================================

    parseWhile() {

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


        const condition =
            this.parseExpression();


        this.consume(
            TokenType.RPAREN,
            null,
            "Expected ')' after condition"
        );


        const body =
            this.parseBlock();


        return {

            type: "WhileStatement",

            condition,

            body

        };

    }

    // ==========================================
// FOR LOOP
// ==========================================

parseFor() {


    this.consume(
        TokenType.KEYWORD,
        "for",
        "Expected 'for'"
    );


    this.consume(
        TokenType.LPAREN,
        null,
        "Expected '(' after for"
    );


    // initialization
    const initialization =
        this.parseAssignment();


    // condition

    const condition =
        this.parseExpression();


    this.consume(
        TokenType.SEMICOLON,
        null,
        "Expected ';' after condition"
    );


    // update

    const update =
        this.parseAssignment();


    this.consume(
        TokenType.RPAREN,
        null,
        "Expected ')' after for"
    );


    const body =
        this.parseBlock();


    return {

        type: "ForStatement",

        initialization,

        condition,

        update,

        body

    };

}
// ==========================================
// DO WHILE
// ==========================================

parseDoWhile() {


    this.consume(
        TokenType.KEYWORD,
        "do",
        "Expected 'do'"
    );


    const body =
        this.parseBlock();


    this.consume(
        TokenType.KEYWORD,
        "while",
        "Expected 'while' after do block"
    );


    this.consume(
        TokenType.LPAREN,
        null,
        "Expected '(' after while"
    );


    const condition =
        this.parseExpression();


    this.consume(
        TokenType.RPAREN,
        null,
        "Expected ')'"
    );


    this.consume(
        TokenType.SEMICOLON,
        null,
        "Missing ';'"
    );


    return {

        type: "DoWhileStatement",

        body,

        condition

    };

}

    // ==========================================
    // RETURN
    // ==========================================

    parseReturn() {

        this.consume(
            TokenType.KEYWORD,
            "return",
            "Expected 'return'"
        );


        let value = null;


        if (
            !this.check(
                TokenType.SEMICOLON,
                null
            )
        ) {

            value =
                this.parseExpression();

        }


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


    // ==========================================
    // EXPRESSION
    // ==========================================

    parseExpression() {

        return this.parseLogicalOr();

    }


    // ==========================================
    // LOGICAL OR
    // ==========================================

    parseLogicalOr() {

        let left =
            this.parseLogicalAnd();


        while (
            this.check(
                TokenType.OPERATOR,
                "||"
            )
        ) {

            const operator =
                this.advance().value;


            const right =
                this.parseLogicalAnd();


            left = {

                type: "BinaryExpression",

                operator,

                left,

                right

            };

        }


        return left;

    }


    // ==========================================
    // LOGICAL AND
    // ==========================================

    parseLogicalAnd() {

        let left =
            this.parseEquality();


        while (
            this.check(
                TokenType.OPERATOR,
                "&&"
            )
        ) {

            const operator =
                this.advance().value;


            const right =
                this.parseEquality();


            left = {

                type: "BinaryExpression",

                operator,

                left,

                right

            };

        }


        return left;

    }


    // ==========================================
    // EQUALITY
    // ==========================================

    parseEquality() {

        let left =
            this.parseComparison();


        while (

            this.check(
                TokenType.OPERATOR,
                "=="
            ) ||

            this.check(
                TokenType.OPERATOR,
                "!="
            )

        ) {

            const operator =
                this.advance().value;


            const right =
                this.parseComparison();


            left = {

                type: "BinaryExpression",

                operator,

                left,

                right

            };

        }


        return left;

    }


    // ==========================================
    // COMPARISON
    // ==========================================

    parseComparison() {

        let left =
            this.parseAddition();


        while (

            this.check(
                TokenType.OPERATOR,
                "<"
            ) ||

            this.check(
                TokenType.OPERATOR,
                ">"
            ) ||

            this.check(
                TokenType.OPERATOR,
                "<="
            ) ||

            this.check(
                TokenType.OPERATOR,
                ">="
            )

        ) {

            const operator =
                this.advance().value;


            const right =
                this.parseAddition();


            left = {

                type: "BinaryExpression",

                operator,

                left,

                right

            };

        }


        return left;

    }


    // ==========================================
    // ADDITION
    // ==========================================

    parseAddition() {

        let left =
            this.parseMultiplication();


        while (

            this.check(
                TokenType.OPERATOR,
                "+"
            ) ||

            this.check(
                TokenType.OPERATOR,
                "-"
            )

        ) {

            const operator =
                this.advance().value;


            const right =
                this.parseMultiplication();


            left = {

                type: "BinaryExpression",

                operator,

                left,

                right

            };

        }


        return left;

    }


    // ==========================================
    // MULTIPLICATION
    // ==========================================

    parseMultiplication() {

        let left =
            this.parseUnary();


        while (

            this.check(
                TokenType.OPERATOR,
                "*"
            ) ||

            this.check(
                TokenType.OPERATOR,
                "/"
            ) ||

            this.check(
                TokenType.OPERATOR,
                "%"
            )

        ) {

            const operator =
                this.advance().value;


            const right =
                this.parseUnary();


            left = {

                type: "BinaryExpression",

                operator,

                left,

                right

            };

        }


        return left;

    }


    // ==========================================
    // UNARY
    // ==========================================

    parseUnary() {

        if (
            this.match(
                TokenType.OPERATOR,
                "!"
            )
        ) {

            const operand =
                this.parseUnary();


            return {

                type: "UnaryExpression",

                operator: "!",

                operand

            };

        }


        return this.parsePrimary();

    }


    // ==========================================
    // PRIMARY
    // ==========================================

    parsePrimary() {

        const token =
            this.peek();


        // INTEGER / FLOAT

        if (

            token.type ===
                TokenType.INTEGER ||

            token.type ===
                TokenType.FLOAT

        ) {

            this.advance();


            return {

                type: "Literal",

                value:
                    Number(
                        token.value
                    )

            };

        }


        // STRING

        if (
            token.type ===
            TokenType.STRING
        ) {

            this.advance();


            return {

                type: "Literal",

                value:
                    token.value

            };

        }


        // TRUE

        if (

            token.type ===
            TokenType.KEYWORD &&

            token.value === "true"

        ) {

            this.advance();


            return {

                type: "Literal",

                value: true

            };

        }


        // FALSE

        if (

            token.type ===
            TokenType.KEYWORD &&

            token.value === "false"

        ) {

            this.advance();


            return {

                type: "Literal",

                value: false

            };

        }


        // IDENTIFIER / FUNCTION CALL

        if (
            token.type ===
            TokenType.IDENTIFIER
        ) {

            this.advance();


            // Function call

            if (
                this.match(
                    TokenType.LPAREN,
                    null
                )
            ) {

                const args = [];


                if (
                    !this.check(
                        TokenType.RPAREN,
                        null
                    )
                ) {

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

                    type:
                        "CallExpression",

                    name:
                        token.value,

                    arguments:
                        args

                };

            }


            // Normal identifier

            return {

                type:
                    "Identifier",

                name:
                    token.value

            };

        }


        // Parenthesized expression

        if (
            this.match(
                TokenType.LPAREN,
                null
            )
        ) {

            const expression =
                this.parseExpression();


            this.consume(
                TokenType.RPAREN,
                null,
                "Expected ')'"
            );


            return expression;

        }


        // Invalid expression

        this.errors.push({

            message:
                "Invalid Expression",

            line:
                token.line,

            column:
                token.column

        });


        this.advance();

        return null;

    }

}


// ==========================================
// PUBLIC FUNCTION
// ==========================================

function parseC(tokens) {

    const parser =
        new Parser(tokens);

    return parser.parse();

}


module.exports = {

    parseC

};