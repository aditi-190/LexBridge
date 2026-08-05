class SemanticAnalyzer {
    constructor() {
        this.errors = [];
        this.currentSymbolTable = {};
        this.functionTable = {};
    }

    analyze(ast) {
        this.errors = [];
        this.currentSymbolTable = {};
        this.functionTable = {};

        if (!ast || ast.type !== "Program") {
            this.errors.push("Invalid AST Structure");
            return { isValid: false, errors: this.errors };
        }

        for (const stmt of ast.body) {
            if (stmt.type === "FunctionDeclaration") {
                this.functionTable[stmt.name] = {
                    returnType: stmt.returnType,
                    params: stmt.params || []
                };
            }
        }

        for (const stmt of ast.body) {
            this.analyzeNode(stmt);
        }

        return {
            isValid: this.errors.length === 0,
            errors: this.errors
        };
    }

    analyzeNode(node) {
        if (!node) return;

        switch (node.type) {
            case "VariableDeclaration":
                if (this.currentSymbolTable[node.identifier || node.name]) {
                    this.errors.push(`Variable '${node.identifier || node.name}' is already declared.`);
                } else {
                    this.currentSymbolTable[node.identifier || node.name] = node.dataType || "int";
                }
                if (node.value) {
                    this.analyzeNode(node.value);
                }
                break;

            case "Assignment":
                if (!this.currentSymbolTable[node.identifier || node.name]) {
                    this.errors.push(`Variable '${node.identifier || node.name}' is not declared.`);
                }
                if (node.value) {
                    this.analyzeNode(node.value);
                }
                break;

            case "Identifier":
                if (!this.currentSymbolTable[node.name || node.identifier]) {
                    this.errors.push(`Variable '${node.name || node.identifier}' is not declared.`);
                }
                break;

            case "FunctionDeclaration": {
                const outerSymbolTable = { ...this.currentSymbolTable };

                if (node.params && Array.isArray(node.params)) {
                    for (const param of node.params) {
                        const paramName = typeof param === 'string' 
                            ? param 
                            : (param.identifier || param.name || param.id || param.varName);
                            
                        const paramType = (typeof param === 'object' && (param.dataType || param.type)) 
                            ? (param.dataType || param.type) 
                            : "int";

                        if (paramName) {
                            this.currentSymbolTable[paramName] = paramType;
                        }
                    }
                }

                if (node.body) {
                    this.analyzeNode(node.body);
                }

                this.currentSymbolTable = outerSymbolTable;
                break;
            }

            case "FunctionCall":
                if (
                    node.name !== "print" &&
                    node.name !== "System.out.println" &&
                    node.name !== "System.out.print" &&
                    node.name !== "sc.close" &&
                    node.name !== "close" &&
                    !node.name.startsWith("sc.") && 
                    !this.functionTable[node.name]
                ) {
                    this.errors.push(`Undeclared Function Error: Function '${node.name}' is not defined.`);
                }
                if (node.arguments) {
                    for (const arg of node.arguments) {
                        this.analyzeNode(arg);
                    }
                }
                break;

            case "BinaryExpression":
                this.analyzeNode(node.left);
                this.analyzeNode(node.right);
                break;

            case "IfStatement":
                this.analyzeNode(node.condition);
                this.analyzeNode(node.thenBranch);
                if (node.elseBranch) this.analyzeNode(node.elseBranch);
                break;

            case "WhileStatement":
            case "DoWhileStatement":
            case "ForStatement":
                if (node.init) this.analyzeNode(node.init);
                if (node.condition) this.analyzeNode(node.condition);
                if (node.update) this.analyzeNode(node.update);
                if (node.body) this.analyzeNode(node.body);
                break;

            case "Block":
                if (node.statements) {
                    for (const stmt of node.statements) {
                        this.analyzeNode(stmt);
                    }
                }
                break;

            case "ReturnStatement":
                if (node.value) this.analyzeNode(node.value);
                break;

            case "ArrayDeclaration":
                this.currentSymbolTable[node.identifier || node.name] = `${node.dataType || "int"}[]`;
                if (node.size) this.analyzeNode(node.size);
                break;

            case "ArrayAccess":
                if (!this.currentSymbolTable[node.name || node.identifier]) {
                    this.errors.push(`Variable '${node.name || node.identifier}' is not declared.`);
                }
                if (node.index) this.analyzeNode(node.index);
                break;

            case "ArrayAssignment":
                if (!this.currentSymbolTable[node.name || node.identifier]) {
                    this.errors.push(`Variable '${node.name || node.identifier}' is not declared.`);
                }
                if (node.index) this.analyzeNode(node.index);
                if (node.value) this.analyzeNode(node.value);
                break;
        }
    }
}

module.exports = SemanticAnalyzer;