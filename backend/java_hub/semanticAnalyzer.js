const SymbolTable = require("./symbolTable");

class SemanticAnalyzer {
    constructor() {
        this.currentScope = new SymbolTable();
        this.errors = [];
        this.setupBuiltInFunctions();
    }
    setupBuiltInFunctions() {
        this.currentScope.define("print", {
            category: "function",
            returnType: "void",
            params: [{ dataType: "ANY" }]
        });
    }

    addError(message) {
        this.errors.push(message);
    }

    analyze(ast) {
        if (!ast || ast.type !== "Program") {
            throw new Error("Invalid AST Root");
        }
        this.visitProgram(ast);
        return {
            isValid: this.errors.length === 0,
            errors: this.errors,
            symbolTable: this.currentScope ? this.currentScope.toObject() : null
        };
    }

    visitProgram(node) {
        for (const statement of node.body) {
            this.visitStatement(statement);
        }
    }

    visitStatement(node) {
        if (!node) return;

        switch (node.type) {
            case "VariableDeclaration":
                this.visitVariableDeclaration(node);
                break;
            case "Assignment":
                this.visitAssignment(node);
                break;
            case "FunctionDeclaration":
                this.visitFunctionDeclaration(node);
                break;
            case "FunctionCall":
                this.visitFunctionCall(node);
                break;
            case "IfStatement":
                this.visitIfStatement(node);
                break;
            case "WhileStatement":
                this.visitWhileStatement(node);
                break;
            case "ForStatement":
                this.visitForStatement(node);
                break;
            case "Block":
                this.visitBlock(node);
                break;
            case "ReturnStatement":
                this.visitReturnStatement(node);
                break;
            default:
                break;
        }
    }

    visitVariableDeclaration(node) {
        const success = this.currentScope.define(node.identifier, {
            category: "variable",
            dataType: node.dataType
        });

        if (!success) {
            this.addError(`Redeclaration Error: Variable '${node.identifier}' is already declared in this scope.`);
        }

        if (node.value) {
            const valueType = this.visitExpression(node.value);
            if (valueType && !this.isTypeCompatible(node.dataType, valueType)) {
                this.addError(`Type Mismatch Error: Cannot assign type '${valueType}' to '${node.dataType}' variable '${node.identifier}'.`);
            }
        }
    }

    visitAssignment(node) {
        const symbol = this.currentScope.lookup(node.identifier);
        if (!symbol) {
            this.addError(`Undeclared Variable Error: Variable '${node.identifier}' is used before declaration.`);
            return;
        }

        if (symbol.category !== "variable") {
            this.addError(`Invalid Assignment: '${node.identifier}' is a function, not a variable.`);
            return;
        }

        const exprType = this.visitExpression(node.value);
        if (exprType && !this.isTypeCompatible(symbol.dataType, exprType)) {
            this.addError(`Type Mismatch Error: Cannot assign '${exprType}' to '${symbol.dataType}' variable '${node.identifier}'.`);
        }
    }

    visitFunctionDeclaration(node) {
        const success = this.currentScope.define(node.name, {
            category: "function",
            returnType: node.returnType,
            params: node.params
        });

        if (!success) {
            this.addError(`Redeclaration Error: Function '${node.name}' is already defined.`);
        }

        const previousScope = this.currentScope;
        this.currentScope = new SymbolTable(previousScope);

        for (const param of node.params) {
            this.currentScope.define(param.identifier, {
                category: "variable",
                dataType: param.dataType
            });
        }

        if (node.body) {
            this.visitBlock(node.body, false); // Don't create double scope
        }

        this.currentScope = previousScope;
    }

    visitBlock(node, createNewScope = true) {
        let previousScope = this.currentScope;
        if (createNewScope) {
            this.currentScope = new SymbolTable(previousScope);
        }

        for (const stmt of node.statements) {
            this.visitStatement(stmt);
        }

        if (createNewScope) {
            this.currentScope = previousScope;
        }
    }

    visitIfStatement(node) {
        const condType = this.visitExpression(node.condition);
        if (condType && condType !== "boolean" && condType !== "BOOLEAN") {
            this.addError(`Type Error: 'if' condition must evaluate to boolean, found '${condType}'.`);
        }
        this.visitStatement(node.thenBranch);
        if (node.elseBranch) {
            this.visitStatement(node.elseBranch);
        }
    }

    visitWhileStatement(node) {
        const condType = this.visitExpression(node.condition);
        if (condType && condType !== "boolean" && condType !== "BOOLEAN") {
            this.addError(`Type Error: 'while' condition must evaluate to boolean, found '${condType}'.`);
        }
        this.visitStatement(node.body);
    }

    visitForStatement(node) {
        const previousScope = this.currentScope;
        this.currentScope = new SymbolTable(previousScope);

        if (node.init) this.visitStatement(node.init);
        if (node.condition) {
            const condType = this.visitExpression(node.condition);
            if (condType && condType !== "boolean" && condType !== "BOOLEAN") {
                this.addError(`Type Error: 'for' condition must evaluate to boolean, found '${condType}'.`);
            }
        }
        if (node.update) this.visitStatement(node.update);
        this.visitStatement(node.body);

        this.currentScope = previousScope;
    }

    visitReturnStatement(node) {
        if (node.value) {
            this.visitExpression(node.value);
        }
    }

    visitExpression(node) {
        if (!node) return null;

        switch (node.type) {
            case "Literal":
                return this.normalizeType(node.rawType || typeof node.value);

            case "Identifier": {
                const symbol = this.currentScope.lookup(node.name);
                if (!symbol) {
                    this.addError(`Undeclared Identifier Error: '${node.name}' is not defined.`);
                    return null;
                }
                return symbol.dataType;
            }

            case "BinaryExpression": {
                const leftType = this.visitExpression(node.left);
                const rightType = this.visitExpression(node.right);

                if (["==", "!=", "<", ">", "<=", ">="].includes(node.operator)) {
                    if (leftType && rightType && !this.isTypeCompatible(leftType, rightType)) {
                        this.addError(`Type Error: Cannot compare type '${leftType}' with '${rightType}'.`);
                    }
                    return "boolean";
                }
                if (leftType === "float" || rightType === "float") return "float";
                if (leftType === "string" || rightType === "string") return "string";
                return "int";
            }

            case "FunctionCall":
                return this.visitFunctionCall(node);

            default:
                return null;
        }
    }

    visitFunctionCall(node) {
        const symbol = this.currentScope.lookup(node.name);
        if (!symbol) {
            this.addError(`Undeclared Function Error: Function '${node.name}' is not defined.`);
            return null;
        }

        if (symbol.category !== "function") {
            this.addError(`Type Error: '${node.name}' is a variable, not a function.`);
            return null;
        }

        if (symbol.params[0]?.dataType !== "ANY" && node.arguments.length !== symbol.params.length) {
            this.addError(`Argument Error: Function '${node.name}' expects ${symbol.params.length} arguments, but received ${node.arguments.length}.`);
        }

        for (let i = 0; i < node.arguments.length; i++) {
            const argType = this.visitExpression(node.arguments[i]);
            const paramType = symbol.params[i]?.dataType;

            if (paramType && paramType !== "ANY" && argType && !this.isTypeCompatible(paramType, argType)) {
                this.addError(`Argument Type Error: Parameter ${i + 1} of '${node.name}' expects '${paramType}', found '${argType}'.`);
            }
        }

        return symbol.returnType;
    }

    normalizeType(type) {
        if (!type) return "int";
        const t = String(type).toLowerCase();
        if (t === "integer" || t === "number") return "int";
        if (t === "bool") return "boolean";
        return t;
    }

    isTypeCompatible(targetType, sourceType) {
        const target = this.normalizeType(targetType);
        const source = this.normalizeType(sourceType);

        if (target === source) return true;
        if (target === "float" && source === "int") return true; // Implicit conversion allowed
        return false;
    }
}

module.exports = SemanticAnalyzer;