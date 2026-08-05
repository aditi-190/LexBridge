const { SymbolTable } = require("./symbolTable");

class SemanticAnalyzer {

    constructor(ast) {

        this.ast = ast;

        this.symbolTable = new SymbolTable();

        this.errors = [];

        this.currentFunction = null;

    }

    analyze() {

        this.registerFunctions(this.ast);

        this.visit(this.ast);

        return {

            errors: this.errors,

            symbolTable:
                this.symbolTable.getAllSymbols()

        };

    }

    registerFunctions(node) {

        if (!node) return;

        if (node.type === "Program") {

            if (Array.isArray(node.body)) {

                node.body.forEach(child => {

                    if (
                        child.type === "FunctionDeclaration" ||
                        child.type === "MainFunction"
                    ) {

                        const functionName =
                            child.name || "main";

                        const returnType =
                            child.returnType || "int";

                        const result =
                            this.symbolTable.declare(
                                functionName,
                                returnType,
                                child.line || 0,
                                "function"
                            );

                        if (!result.success) {

                            this.addError(
                                result.error,
                                child.line || 0
                            );

                        }

                    }

                });

            }

        }

    }

    addError(message, line = 0) {

        this.errors.push({

            message,

            line

        });

    }

    visit(node) {

        if (!node) return;

        switch (node.type) {

            case "Program":

                if (Array.isArray(node.body)) {

                    node.body.forEach(
                        child => this.visit(child)
                    );

                }

                break;

            case "MainFunction": {

                const previousFunction =
                    this.currentFunction;

                this.currentFunction = {

                    name:
                        node.name || "main",

                    returnType:
                        node.returnType || "int"

                };

                this.symbolTable.enterScope();

                if (Array.isArray(node.params)) {

                    node.params.forEach(param => {

                        const result =
                            this.symbolTable.declare(
                                param.name,
                                param.dataType || "int",
                                param.line || 0,
                                "parameter"
                            );

                        if (!result.success) {

                            this.addError(
                                result.error,
                                param.line || 0
                            );

                        }

                    });

                }

                if (
                    node.body &&
                    Array.isArray(node.body.body)
                ) {

                    node.body.body.forEach(
                        statement =>
                            this.visit(statement)
                    );

                }

                this.symbolTable.exitScope();

                this.currentFunction =
                    previousFunction;

                break;

            }

            case "FunctionDeclaration": {

                const previousFunction =
                    this.currentFunction;

                this.currentFunction = {

                    name: node.name,

                    returnType:
                        node.returnType || "int"

                };

                this.symbolTable.enterScope();

                if (Array.isArray(node.params)) {

                    node.params.forEach(param => {

                        const result =
                            this.symbolTable.declare(
                                param.name,
                                param.dataType || "int",
                                param.line || 0,
                                "parameter"
                            );

                        if (!result.success) {

                            this.addError(
                                result.error,
                                param.line || 0
                            );

                        }

                    });

                }

                if (
                    node.body &&
                    Array.isArray(node.body.body)
                ) {

                    node.body.body.forEach(
                        statement =>
                            this.visit(statement)
                    );

                }

                this.symbolTable.exitScope();

                this.currentFunction =
                    previousFunction;

                break;

            }

            case "Block": {

                this.symbolTable.enterScope();

                if (Array.isArray(node.body)) {

                    node.body.forEach(
                        statement =>
                            this.visit(statement)
                    );

                }

                this.symbolTable.exitScope();

                break;

            }
            case "VariableDeclaration":

    this.checkDeclaration(node);

    break;

case "Assignment":

    this.checkAssignment(node);

    break;

case "ReturnStatement":

    this.checkReturn(node);

    break;

case "CoutStatement":

    this.checkCout(node);

    break;

case "CinStatement":

    this.checkCin(node);

    break;

case "IfStatement":

    this.checkIf(node);

    break;

case "WhileStatement":

    this.checkWhile(node);

    break;
case "ForStatement":

    this.checkFor(node);

    break;

}
}
                // ==========================================
    // Variable Declaration
    // ==========================================

    checkDeclaration(node) {

        const result = this.symbolTable.declare(
            node.identifier,
            node.dataType,
            node.line || 0,
            "variable"
        );

        if (!result.success) {

            this.errors.push({
                message: result.error,
                line: node.line || 0
            });

            return;
        }

        if (node.value) {

            this.checkExpression(node.value);

        }

    }

    // ==========================================
    // Assignment
    // ==========================================

    checkAssignment(node) {

        const symbol = this.symbolTable.lookup(
            node.identifier
        );

        if (!symbol) {

            this.errors.push({
                message:
                    `Variable '${node.identifier}' not declared`,
                line: node.line || 0
            });

        }

        this.checkExpression(node.value);

    }

    // ==========================================
    // Return
    // ==========================================

    checkReturn(node) {

        if (node.value) {

            this.checkExpression(node.value);

        }

    }

    // ==========================================
    // Cout
    // ==========================================

    checkCout(node) {

        if (!node.values) return;

        node.values.forEach(value => {

            this.checkExpression(value);

        });

    }

    // ==========================================
    // Cin
    // ==========================================

    checkCin(node) {

        if (!node.variables) return;

        node.variables.forEach(variable => {

            const symbol =
                this.symbolTable.lookup(variable);

            if (!symbol) {

                this.errors.push({

                    message:
                        `Variable '${variable}' not declared`,

                    line: node.line || 0

                });

            }

        });

    }

    // ==========================================
    // If Statement
    // ==========================================

    checkIf(node) {

        this.checkExpression(node.condition);

        this.visit(node.thenBranch);

        if (node.elseBranch) {

            this.visit(node.elseBranch);

        }

    }

    // ==========================================
    // While Statement
    // ==========================================

    checkWhile(node) {

        this.checkExpression(node.condition);

        this.visit(node.body);

    }

    //check for 
    checkFor(node) {

    if (node.initialization) {

        this.visit(node.initialization);

    }

    if (node.condition) {

        this.checkExpression(node.condition);

    }

    if (node.update) {

        this.visit(node.update);

    }

    if (node.body) {

        this.visit(node.body);

    }

}
        // ===============================
    // Check Function Call
    // ===============================
    checkFunctionCall(node) {

        const symbol = this.symbolTable.lookup(node.name);

        if (!symbol) {

            this.errors.push({
                message: `Function '${node.name}' not declared`
            });

            return;
        }

        if (symbol.kind !== "function") {

            this.errors.push({
                message: `'${node.name}' is not a function`
            });

        }

        if (node.arguments) {

            node.arguments.forEach(arg => {
                this.checkExpression(arg);
            });

        }

    }

    // ===============================
    // Check Expression
    // ===============================
    checkExpression(node) {

        if (!node) return;

        switch (node.type) {

            case "Identifier":

                if (!this.symbolTable.lookup(node.name)) {

                    this.errors.push({
                        message: `Variable '${node.name}' not declared`
                    });

                }

                break;

            case "BinaryExpression":

                this.checkExpression(node.left);
                this.checkExpression(node.right);

                break;

            case "UnaryExpression":

                this.checkExpression(node.operand);

                break;

            case "CallExpression":

                this.checkFunctionCall(node);

                break;

            case "Literal":

                break;
            case "ExpressionStatement":

    this.checkExpression(node.expression);

    break;
        }

    }

    // ===============================
    // Expression Type
    // ===============================
    getExpressionType(node) {

        if (!node) return null;

        switch (node.type) {

            case "Literal":

                if (typeof node.value === "number") {

                    return Number.isInteger(node.value)
                        ? "int"
                        : "double";

                }

                if (typeof node.value === "boolean") {

                    return "bool";

                }

                if (typeof node.value === "string") {

                    return "string";

                }

                return null;

            case "Identifier": {

                const symbol = this.symbolTable.lookup(node.name);

                return symbol ? symbol.type : null;

            }

            case "CallExpression": {

                const symbol = this.symbolTable.lookup(node.name);

                if (symbol && symbol.kind === "function") {

                    return symbol.type;

                }

                return null;

            }

            case "BinaryExpression": {

                const left = this.getExpressionType(node.left);
                const right = this.getExpressionType(node.right);

                if (
                    node.operator === "==" ||
                    node.operator === "!=" ||
                    node.operator === "<" ||
                    node.operator === ">" ||
                    node.operator === "<=" ||
                    node.operator === ">=" ||
                    node.operator === "&&" ||
                    node.operator === "||"
                ) {

                    return "bool";

                }

                if (
                    left === "double" ||
                    right === "double"
                ) {

                    return "double";

                }

                return left || right;

            }

            case "UnaryExpression":

                return this.getExpressionType(node.operand);

            default:

                return null;
        }

    }

}
function analyzeSemantic(ast) {

    const analyzer = new SemanticAnalyzer(ast);

    return analyzer.analyze();

}

module.exports = {

    SemanticAnalyzer,

    analyzeSemantic

};