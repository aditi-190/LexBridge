const lexer = require("./lexer");
const AST = require("./ast");

// Modifiers that Java allows before a class/field/method but that this
// subset compiler does not need to enforce semantically. We consume and
// discard them.
const MODIFIER_KEYWORDS = ["public", "private", "protected", "static", "final"];

class Parser {
    constructor(code) {
        this.tokens = lexer(code);
        this.current = 0;
    }

    currentToken() {
        return this.tokens[this.current] || { type: "EOF", value: "EOF" };
    }

    next() {
        this.current++;
    }

    match(type, value = null) {
        const token = this.currentToken();
        if (!token) return false;
        if (value !== null) {
            return token.type === type && token.value === value;
        }
        return token.type === type;
    }

    expect(type, value = null) {
        const token = this.currentToken();
        if (value !== null) {
            if (token.type !== type || token.value !== value) {
                throw new Error(
                    `Expected '${value}' (${type}) but found '${token.value}' at line ${token.line}`
                );
            }
        } else if (token.type !== type) {
            throw new Error(
                `Expected ${type} but found ${token.type} at line ${token.line}`
            );
        }
        this.next();
        return token;
    }

    // ------------------------------------------------------------------
    // Java boilerplate helpers: "public class Test { public static void
    // main(String[] args) { ... } }"
    // ------------------------------------------------------------------

    /**
     * Consumes any run of modifier keywords (public/private/protected/
     * static/final) at the current position without producing AST nodes.
     */
    skipModifiers() {
        while (
            this.match("KEYWORD") &&
            MODIFIER_KEYWORDS.includes(this.currentToken().value)
        ) {
            this.next();
        }
    }

    /**
     * Lookahead (non-consuming): does the token stream, after skipping any
     * modifiers, start a "class" declaration at the current position?
     */
    isClassStart() {
        let idx = this.current;
        while (
            this.tokens[idx] &&
            this.tokens[idx].type === "KEYWORD" &&
            MODIFIER_KEYWORDS.includes(this.tokens[idx].value)
        ) {
            idx++;
        }
        return (
            this.tokens[idx] &&
            this.tokens[idx].type === "KEYWORD" &&
            this.tokens[idx].value === "class"
        );
    }

    /**
     * Parses:  [modifiers] class ID { member* }
     * Returns a FLAT ARRAY of statements/declarations meant to be spliced
     * straight into the enclosing Program body. Specifically:
     *   - a method named "main" has its body statements unwrapped directly
     *     into the returned array (so `main`'s code executes as if it were
     *     top-level code — this is what lets your subset interpreter run
     *     standard Java entry points without any special-casing downstream).
     *   - any other method becomes a normal FunctionDeclaration node.
     *   - fields become normal VariableDeclaration nodes.
     */
    parseClassDeclaration() {
        this.skipModifiers();
        this.expect("KEYWORD", "class");
        this.expect("IDENTIFIER"); // class name — not needed by this subset compiler
        this.expect("LBRACE");

        const collected = [];

        while (!this.match("RBRACE") && !this.match("EOF")) {
            this.skipModifiers();

            const member = this.parseVariableOrFunctionDeclaration();

            if (member.type === "FunctionDeclaration" && member.name === "main") {
                // Unwrap main(...)'s body directly into the program.
                collected.push(...member.body.statements);
            } else {
                collected.push(member);
            }
        }

        this.expect("RBRACE");
        return collected;
    }

    // ------------------------------------------------------------------

    parseProgram() {
        const body = [];
        while (!this.match("EOF")) {
            if (this.isClassStart()) {
                const classStatements = this.parseClassDeclaration();
                body.push(...classStatements);
            } else {
                body.push(this.parseStatement());
            }
        }
        return AST.ProgramNode(body);
    }

    parseStatement() {
        const token = this.currentToken();

        if (this.match("LBRACE")) {
            return this.parseBlock();
        }

        if (token.type === "KEYWORD") {
            switch (token.value) {
                case "int":
                case "float":
                case "string":
                case "String":
                case "bool":
                case "boolean":
                case "void":
                    return this.parseVariableOrFunctionDeclaration();

                case "if":
                    return this.parseIfStatement();

                case "while":
                    return this.parseWhileStatement();

                case "for":
                    return this.parseForStatement();

                case "return":
                    return this.parseReturnStatement();

                case "print":
                    return this.parsePrintStatement();
            }
        }

        if (token.type === "IDENTIFIER") {
            return this.parseAssignmentOrFunctionCall();
        }

        throw new Error(`Unexpected token '${token.value}' at line ${token.line}`);
    }

    parseVariableOrFunctionDeclaration() {
        const dataType = this.expect("KEYWORD").value;
        const identifier = this.expect("IDENTIFIER").value;

        if (this.match("LPAREN")) {
            this.next(); // Consume '('
            const params = [];

            while (!this.match("RPAREN")) {
                const paramType = this.expect("KEYWORD").value;

                // Support Java-style array parameter types, e.g. String[] args.
                // We don't model arrays downstream, so we just consume the
                // brackets and keep the base type.
                if (this.match("LBRACKET")) {
                    this.next();
                    this.expect("RBRACKET");
                }

                const paramName = this.expect("IDENTIFIER").value;
                params.push({ dataType: paramType, identifier: paramName });

                if (this.match("COMMA")) {
                    this.next();
                }
            }
            this.expect("RPAREN");

            const body = this.parseBlock();
            return AST.FunctionDeclarationNode(dataType, identifier, params, body);
        }

        let value = null;
        if (this.match("OPERATOR", "=")) {
            this.next();
            value = this.parseExpression();
        }

        this.expect("SEMICOLON");
        return AST.VariableDeclarationNode(dataType, identifier, value);
    }

    parseBlock() {
        this.expect("LBRACE");
        const statements = [];

        while (!this.match("RBRACE") && !this.match("EOF")) {
            statements.push(this.parseStatement());
        }

        this.expect("RBRACE");
        return AST.BlockNode(statements);
    }

    parseIfStatement() {
        this.expect("KEYWORD", "if");
        this.expect("LPAREN");
        const condition = this.parseExpression();
        this.expect("RPAREN");

        const thenBranch = this.parseStatement();
        let elseBranch = null;

        if (this.match("KEYWORD", "else")) {
            this.next();
            elseBranch = this.parseStatement();
        }

        return AST.IfStatementNode(condition, thenBranch, elseBranch);
    }

    parseWhileStatement() {
        this.expect("KEYWORD", "while");
        this.expect("LPAREN");
        const condition = this.parseExpression();
        this.expect("RPAREN");

        const body = this.parseStatement();
        return AST.WhileStatementNode(condition, body);
    }

    parseForStatement() {
        this.expect("KEYWORD", "for");
        this.expect("LPAREN");

        let init = null;
        if (!this.match("SEMICOLON")) {
            if (this.match("KEYWORD")) {
                init = this.parseVariableOrFunctionDeclaration();
            } else {
                init = this.parseAssignmentOrFunctionCall();
            }
        } else {
            this.expect("SEMICOLON");
        }

        let condition = null;
        if (!this.match("SEMICOLON")) {
            condition = this.parseExpression();
        }
        this.expect("SEMICOLON");

        let update = null;
        if (!this.match("RPAREN")) {
            const identifier = this.expect("IDENTIFIER").value;
            this.expect("OPERATOR", "=");
            const value = this.parseExpression();
            update = AST.AssignmentNode(identifier, value);
        }
        this.expect("RPAREN");

        const body = this.parseStatement();
        return AST.ForStatementNode(init, condition, update, body);
    }

    parseReturnStatement() {
        this.expect("KEYWORD", "return");
        let value = null;

        if (!this.match("SEMICOLON")) {
            value = this.parseExpression();
        }

        this.expect("SEMICOLON");
        return AST.ReturnStatementNode(value);
    }

    parsePrintStatement() {
        this.expect("KEYWORD", "print");
        this.expect("LPAREN");

        const args = [];
        if (!this.match("RPAREN")) {
            args.push(this.parseExpression());
            while (this.match("COMMA")) {
                this.next();
                args.push(this.parseExpression());
            }
        }

        this.expect("RPAREN");
        this.expect("SEMICOLON");

        return AST.FunctionCallNode("print", args);
    }

    parseAssignmentOrFunctionCall() {
        const identifier = this.expect("IDENTIFIER").value;

        if (this.match("OPERATOR", "=")) {
            this.next();
            const value = this.parseExpression();
            this.expect("SEMICOLON");
            return AST.AssignmentNode(identifier, value);
        }

        if (this.match("LPAREN")) {
            this.next();
            const args = [];

            if (!this.match("RPAREN")) {
                args.push(this.parseExpression());
                while (this.match("COMMA")) {
                    this.next();
                    args.push(this.parseExpression());
                }
            }

            this.expect("RPAREN");
            this.expect("SEMICOLON");
            return AST.FunctionCallNode(identifier, args);
        }

        throw new Error(`Invalid statement starting with '${identifier}'`);
    }
    parseExpression() {
        return this.parseRelational();
    }

    parseRelational() {
        let left = this.parseAdditive();

        while (
            this.match("OPERATOR") &&
            ["==", "!=", "<", ">", "<=", ">="].includes(this.currentToken().value)
        ) {
            const operator = this.currentToken().value;
            this.next();
            const right = this.parseAdditive();
            left = AST.BinaryExpressionNode(operator, left, right);
        }

        return left;
    }

    parseAdditive() {
        let left = this.parseMultiplicative();

        while (
            this.match("OPERATOR") &&
            ["+", "-"].includes(this.currentToken().value)
        ) {
            const operator = this.currentToken().value;
            this.next();
            const right = this.parseMultiplicative();
            left = AST.BinaryExpressionNode(operator, left, right);
        }

        return left;
    }

    parseMultiplicative() {
        let left = this.parsePrimary();

        while (
            this.match("OPERATOR") &&
            ["*", "/"].includes(this.currentToken().value)
        ) {
            const operator = this.currentToken().value;
            this.next();
            const right = this.parsePrimary();
            left = AST.BinaryExpressionNode(operator, left, right);
        }

        return left;
    }
    parsePrimary() {
        const token = this.currentToken();

        if (this.match("LPAREN")) {
            this.next();
            const expr = this.parseExpression();
            this.expect("RPAREN");
            return expr;
        }

        if (token.type === "INTEGER" || token.type === "FLOAT") {
            this.next();
            return AST.LiteralNode(Number(token.value), token.type);
        }

        if (token.type === "STRING" || token.type === "BOOLEAN") {
            this.next();
            return AST.LiteralNode(token.value, token.type);
        }

        if (token.type === "IDENTIFIER") {
            const name = token.value;
            this.next();
            if (this.match("LPAREN")) {
                this.next();
                const args = [];
                if (!this.match("RPAREN")) {
                    args.push(this.parseExpression());
                    while (this.match("COMMA")) {
                        this.next();
                        args.push(this.parseExpression());
                    }
                }
                this.expect("RPAREN");
                return AST.FunctionCallNode(name, args);
            }

            return AST.IdentifierNode(name);
        }

        throw new Error(`Unexpected expression token '${token.value}' at line ${token.line}`);
    }
}

module.exports = Parser;