class Parser {
    constructor(code) {
        this.code = code;
        this.tokens = this.tokenize(code);
        this.index = 0;
    }

    tokenize(code) {
        const tokenSpec = [
            { type: "SPACE", regex: /^\s+/ },
            { type: "COMMENT", regex: /^(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/ },
            { type: "KEYWORD", regex: /^(public|class|static|void|int|double|boolean|String|if|else|while|do|for|return|new|Scanner|import|break)\b/ },
            { type: "IDENTIFIER", regex: /^[a-zA-Z_][a-zA-Z0-9_.]*/ },
            { type: "NUMBER", regex: /^\d+(\.\d+)?/ },
            { type: "STRING", regex: /^"[^"]*"/ },
            { type: "OPERATOR", regex: /^(==|!=|<=|>=|&&|\|\||\+\+|--|\+|-|\*|\/|%|=|<|>)/ },
            { type: "PUNCTUATION", regex: /^[{}(),;\[\]]/ }
        ];

        let tokens = [];
        let cursor = 0;

        while (cursor < code.length) {
            let matched = false;
            for (const { type, regex } of tokenSpec) {
                const match = code.slice(cursor).match(regex);
                if (match) {
                    matched = true;
                    if (type !== "SPACE" && type !== "COMMENT") {
                        tokens.push({ type, value: match[0] });
                    }
                    cursor += match[0].length;
                    break;
                }
            }
            if (!matched) cursor++;
        }
        return tokens;
    }

    peek() {
        return this.tokens[this.index] || null;
    }

    consume(expectedValue = null) {
        const token = this.peek();
        if (!token) throw new Error("Unexpected end of input");
        if (expectedValue && token.value !== expectedValue) {
            throw new Error(`Expected '${expectedValue}' but found '${token.value}'`);
        }
        this.index++;
        return token;
    }

    match(value) {
        const token = this.peek();
        return token && token.value === value;
    }

    parseProgram() {
        while (this.peek() && this.peek().value === "import") {
            while (this.peek() && this.peek().value !== ";") this.index++;
            if (this.peek()) this.consume(";");
        }

        if (this.match("public") || this.match("class")) {
            if (this.match("public")) this.consume("public");
            this.consume("class");
            this.consume(); 
            this.consume("{");
        }

        const body = [];
        while (this.peek() && !this.match("}")) {
            body.push(this.parseFunctionDeclaration());
        }

        if (this.match("}")) this.consume("}");

        return { type: "Program", body };
    }

    parseFunctionDeclaration() {
        if (this.match("public")) this.consume("public");
        if (this.match("static")) this.consume("static");

        const returnType = this.consume().value; 
        const name = this.consume().value; 

        this.consume("(");
        const params = [];
        while (this.peek() && !this.match(")")) {
            const pType = this.consume().value;
            let pName = this.consume().value;
            if (pName === "[" && this.match("]")) {
                this.consume("]");
                pName = this.consume().value;
            }
            params.push({ dataType: pType, identifier: pName, name: pName });
            if (this.match(",")) this.consume(",");
        }
        this.consume(")");

        const body = this.parseBlock();
        return { type: "FunctionDeclaration", name, returnType, params, body };
    }

    parseBlock() {
        this.consume("{");
        const statements = [];
        while (this.peek() && !this.match("}")) {
            statements.push(this.parseStatement());
        }
        this.consume("}");
        return { type: "Block", statements };
    }

    parseStatement() {
        const token = this.peek();
        if (!token) return null;

        if (token.value === "{") return this.parseBlock();

        if (token.value === "if") {
            this.consume("if");
            this.consume("(");
            const condition = this.parseExpression();
            this.consume(")");
            const thenBranch = this.parseStatement();
            let elseBranch = null;
            if (this.match("else")) {
                this.consume("else");
                elseBranch = this.parseStatement();
            }
            return { type: "IfStatement", condition, thenBranch, elseBranch };
        }

        if (token.value === "while") {
            this.consume("while");
            this.consume("(");
            const condition = this.parseExpression();
            this.consume(")");
            const body = this.parseStatement();
            return { type: "WhileStatement", condition, body };
        }

        if (token.value === "do") {
            this.consume("do");
            const body = this.parseStatement();
            this.consume("while");
            this.consume("(");
            const condition = this.parseExpression();
            this.consume(")");
            if (this.match(";")) this.consume(";");
            return { type: "DoWhileStatement", body, condition };
        }

        if (token.value === "for") {
            this.consume("for");
            this.consume("(");
            let init = null;
            if (!this.match(";")) init = this.parseStatementNoSemicolon();
            this.consume(";");
            let condition = null;
            if (!this.match(";")) condition = this.parseExpression();
            this.consume(";");
            let update = null;
            if (!this.match(")")) update = this.parseStatementNoSemicolon();
            this.consume(")");
            const body = this.parseStatement();
            return { type: "ForStatement", init, condition, update, body };
        }

        if (token.value === "return") {
            this.consume("return");
            let value = null;
            if (!this.match(";")) value = this.parseExpression();
            if (this.match(";")) this.consume(";");
            return { type: "ReturnStatement", value };
        }

        if (token.value === "Scanner") {
            this.consume("Scanner");
            this.consume(); 
            this.consume("=");
            this.consume("new");
            this.consume("Scanner");
            this.consume("(");
            this.consume("System.in");
            this.consume(")");
            this.consume(";");
            return { type: "ScannerInit" };
        }

        const stmt = this.parseStatementNoSemicolon();
        if (this.match(";")) this.consume(";");
        return stmt;
    }

    parseStatementNoSemicolon() {
        const token = this.peek();

        if (["int", "double", "boolean", "String"].includes(token.value)) {
            const dataType = this.consume().value;
            let isArray = false;
            if (this.match("[")) {
                this.consume("[");
                this.consume("]");
                isArray = true;
            }
            const name = this.consume().value;

            if (isArray) {
                let size = null;
                if (this.match("=")) {
                    this.consume("=");
                    this.consume("new");
                    this.consume(); 
                    this.consume("[");
                    size = this.parseExpression();
                    this.consume("]");
                }
                return { type: "ArrayDeclaration", dataType, identifier: name, name, size };
            }

            let value = null;
            if (this.match("=")) {
                this.consume("=");
                value = this.parseExpression();
            }
            return { type: "VariableDeclaration", dataType, identifier: name, name, value };
        }

        if (token.type === "IDENTIFIER") {
            const nextToken = this.tokens[this.index + 1];

            if (nextToken && nextToken.value === "[") {
                const name = this.consume().value;
                this.consume("[");
                const index = this.parseExpression();
                this.consume("]");
                this.consume("=");
                const value = this.parseExpression();
                return { type: "ArrayAssignment", name, identifier: name, index, value };
            }

            if (nextToken && (nextToken.value === "++" || nextToken.value === "--")) {
                const name = this.consume().value;
                const op = this.consume().value;
                return { type: "UpdateExpression", identifier: name, name, operator: op };
            }

            if (nextToken && nextToken.value === "=") {
                const name = this.consume().value;
                this.consume("=");
                const value = this.parseExpression();
                return { type: "Assignment", identifier: name, name, value };
            }

            if (nextToken && nextToken.value === "(") {
                return this.parseExpression();
            }
        }

        return this.parseExpression();
    }

    parseExpression() {
        return this.parseLogicalOr();
    }

    parseLogicalOr() {
        let left = this.parseLogicalAnd();
        while (this.match("||")) {
            const op = this.consume().value;
            const right = this.parseLogicalAnd();
            left = { type: "BinaryExpression", operator: op, left, right };
        }
        return left;
    }

    parseLogicalAnd() {
        let left = this.parseEquality();
        while (this.match("&&")) {
            const op = this.consume().value;
            const right = this.parseEquality();
            left = { type: "BinaryExpression", operator: op, left, right };
        }
        return left;
    }

    parseEquality() {
        let left = this.parseRelational();
        while (this.match("==") || this.match("!=")) {
            const op = this.consume().value;
            const right = this.parseRelational();
            left = { type: "BinaryExpression", operator: op, left, right };
        }
        return left;
    }

    parseRelational() {
        let left = this.parseAdditive();
        while (this.match("<") || this.match(">") || this.match("<=") || this.match(">=")) {
            const op = this.consume().value;
            const right = this.parseAdditive();
            left = { type: "BinaryExpression", operator: op, left, right };
        }
        return left;
    }

    parseAdditive() {
        let left = this.parseMultiplicative();
        while (this.match("+") || this.match("-")) {
            const op = this.consume().value;
            const right = this.parseMultiplicative();
            left = { type: "BinaryExpression", operator: op, left, right };
        }
        return left;
    }

    parseMultiplicative() {
        let left = this.parsePrimary();
        while (this.match("*") || this.match("/") || this.match("%")) {
            const op = this.consume().value;
            const right = this.parsePrimary();
            left = { type: "BinaryExpression", operator: op, left, right };
        }
        return left;
    }

    parsePrimary() {
        const token = this.peek();

        if (token.type === "NUMBER") {
            return { type: "Literal", value: Number(this.consume().value), rawType: "NUMBER" };
        }

        if (token.type === "STRING") {
            const strVal = this.consume().value.slice(1, -1);
            return { type: "Literal", value: strVal, rawType: "STRING" };
        }

        if (token.value === "true" || token.value === "false") {
            return { type: "Literal", value: this.consume().value === "true", rawType: "BOOLEAN" };
        }

        if (token.value === "(") {
            this.consume("(");
            const expr = this.parseExpression();
            this.consume(")");
            return expr;
        }

        if (token.type === "IDENTIFIER") {
            const nextToken = this.tokens[this.index + 1];

            if (nextToken && nextToken.value === "(") {
                const name = this.consume().value;
                this.consume("(");
                const args = [];
                while (this.peek() && !this.match(")")) {
                    args.push(this.parseExpression());
                    if (this.match(",")) this.consume(",");
                }
                this.consume(")");
                return { type: "FunctionCall", name, arguments: args };
            }

            if (nextToken && nextToken.value === "[") {
                const name = this.consume().value;
                this.consume("[");
                const index = this.parseExpression();
                this.consume("]");
                return { type: "ArrayAccess", name, identifier: name, index };
            }

            if (nextToken && nextToken.value === ".") {
                const obj = this.consume().value;
                this.consume(".");
                const method = this.consume().value;
                if (method.startsWith("next") || method === "nextInt") {
                    this.consume("(");
                    this.consume(")");
                    return { type: "ScannerRead", scanner: obj };
                }
                const fullName = `${obj}.${method}`;
                if (this.match("(")) {
                    this.consume("(");
                    const args = [];
                    while (this.peek() && !this.match(")")) {
                        args.push(this.parseExpression());
                        if (this.match(",")) this.consume(",");
                    }
                    this.consume(")");
                    return { type: "FunctionCall", name: fullName, arguments: args };
                }
                return { type: "Identifier", name: fullName, identifier: fullName };
            }

            const name = this.consume().value;
            return { type: "Identifier", name, identifier: name };
        }

        throw new Error(`Unexpected token '${token.value}'`);
    }
}

module.exports = Parser;