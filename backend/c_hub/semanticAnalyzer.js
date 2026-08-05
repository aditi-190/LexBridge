const { SymbolTable } = require("./symbolTable");

class SemanticAnalyzer {

    constructor(ast) {

        this.ast = ast;

        this.symbolTable = new SymbolTable();

        this.errors = [];

        this.currentFunction = null;

        // Built-in C functions
        this.builtInFunctions = {
            printf: {
                returnType: "int"
            }
        };

    }


    // ==========================================
    // ANALYZE
    // ==========================================

    analyze() {

        // Register user-defined functions first
        this.registerFunctions(this.ast);

        // Analyze complete AST
        this.visit(this.ast);

        return {

            errors: this.errors,

            symbolTable:
                this.symbolTable.getAllSymbols()

        };

    }


    // ==========================================
    // REGISTER USER FUNCTIONS
    // ==========================================

    registerFunctions(node) {

        if (!node) return;

        if (node.type !== "Program") {

            return;

        }

        if (!Array.isArray(node.body)) {

            return;

        }

        node.body.forEach(child => {

            if (
                child &&
                (
                    child.type === "FunctionDeclaration" ||
                    child.type === "MainFunction"
                )
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


    // ==========================================
    // ERROR
    // ==========================================

    addError(message, line = 0) {

        this.errors.push({

            message,

            line

        });

    }


    // ==========================================
    // VISITOR
    // ==========================================

    visit(node) {

        if (!node) return;

        switch (node.type) {


            // ==================================
            // PROGRAM
            // ==================================

            case "Program":

                if (Array.isArray(node.body)) {

                    node.body.forEach(
                        child =>
                            this.visit(child)
                    );

                }

                break;
                case "ForStatement":

    this.visit(node.initialization);

    this.visit(node.condition);

    this.visit(node.update);

    this.visit(node.body);

    break;

    case "DoWhileStatement":

    this.visit(node.body);

    this.visit(node.condition);

    break;

    case "ScanfStatement":
           this.symbolTable[node.variable] = "int";

    break;


            // ==================================
            // INCLUDE
            // ==================================

            case "IncludeDirective":

                // Example:
                // #include <stdio.h>
                //
                // No semantic action needed here.

                break;


            // ==================================
            // MAIN FUNCTION
            // ==================================

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


                if (
                    Array.isArray(
                        node.params
                    )
                ) {

                    node.params.forEach(
                        param => {

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

                        }
                    );

                }


                if (
                    node.body &&
                    Array.isArray(
                        node.body.body
                    )
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


            // ==================================
            // USER FUNCTION
            // ==================================

            case "FunctionDeclaration": {

                const previousFunction =
                    this.currentFunction;

                this.currentFunction = {

                    name:
                        node.name,

                    returnType:
                        node.returnType || "int"

                };


                this.symbolTable.enterScope();


                if (
                    Array.isArray(
                        node.params
                    )
                ) {

                    node.params.forEach(
                        param => {

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

                        }
                    );

                }


                if (
                    node.body &&
                    Array.isArray(
                        node.body.body
                    )
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


            // ==================================
            // BLOCK
            // ==================================

            case "Block": {

                this.symbolTable.enterScope();

                if (
                    Array.isArray(
                        node.body
                    )
                ) {

                    node.body.forEach(
                        statement =>
                            this.visit(statement)
                    );

                }

                this.symbolTable.exitScope();

                break;

            }


            // ==================================
            // VARIABLE DECLARATION
            // ==================================

            case "VariableDeclaration":

                this.checkDeclaration(node);

                break;


            // ==================================
            // ASSIGNMENT
            // ==================================

            case "Assignment":

                this.checkAssignment(node);

                break;


            // ==================================
            // IF
            // ==================================

            case "IfStatement":

                this.checkIfStatement(node);

                break;


            // ==================================
            // WHILE
            // ==================================

            case "WhileStatement":

                this.checkWhileStatement(node);

                break;


            // ==================================
            // PRINT
            // ==================================

            case "PrintStatement":

                this.checkExpression(
                    node.value
                );

                break;


            // ==================================
            // RETURN
            // ==================================

            case "ReturnStatement":

                this.checkReturnStatement(node);

                break;

        }

    }


    // ==========================================
    // VARIABLE DECLARATION
    // ==========================================

    checkDeclaration(node) {

        const result =
            this.symbolTable.declare(
                node.identifier,
                node.dataType,
                node.line || 0,
                "variable"
            );


        if (!result.success) {

            this.addError(
                result.error,
                node.line || 0
            );

            return;

        }


        if (node.value) {

            const valueType =
                this.getExpressionType(
                    node.value
                );


            if (
                valueType &&
                node.dataType &&
                valueType !== node.dataType
            ) {

                this.addError(
                    `Cannot initialize '${node.dataType}' ` +
                    `with '${valueType}'`,
                    node.line || 0
                );

            }


            this.checkExpression(
                node.value
            );

        }

    }


    // ==========================================
    // ASSIGNMENT
    // ==========================================

    checkAssignment(node) {

        const symbol =
            this.symbolTable.lookup(
                node.identifier
            );


        if (!symbol) {

            this.addError(
                `Variable '${node.identifier}' not declared`,
                node.line || 0
            );

            this.checkExpression(
                node.value
            );

            return;

        }


        if (
            symbol.kind === "function"
        ) {

            this.addError(
                `'${node.identifier}' is a function and cannot be assigned`,
                node.line || 0
            );

            return;

        }


        if (node.value) {

            const valueType =
                this.getExpressionType(
                    node.value
                );


            if (
                valueType &&
                symbol.type &&
                valueType !== symbol.type
            ) {

                this.addError(
                    `Cannot assign '${valueType}' to ` +
                    `'${symbol.type}' variable '${node.identifier}'`,
                    node.line || 0
                );

            }


            this.checkExpression(
                node.value
            );

        }

    }


    // ==========================================
    // IF
    // ==========================================

    checkIfStatement(node) {

        this.checkExpression(
            node.condition
        );


        if (node.thenBranch) {

            this.visit(
                node.thenBranch
            );

        }


        if (node.elseBranch) {

            this.visit(
                node.elseBranch
            );

        }

    }


    // ==========================================
    // WHILE
    // ==========================================

    checkWhileStatement(node) {

        this.checkExpression(
            node.condition
        );


        if (node.body) {

            this.visit(
                node.body
            );

        }

    }


    // ==========================================
    // RETURN
    // ==========================================

    checkReturnStatement(node) {

        if (!this.currentFunction) {

            this.addError(
                "Return statement outside function",
                node.line || 0
            );

            return;

        }


        if (!node.value) {

            if (
                this.currentFunction.returnType !==
                "void"
            ) {

                this.addError(
                    `Function '${this.currentFunction.name}' ` +
                    `must return '${this.currentFunction.returnType}'`,
                    node.line || 0
                );

            }

            return;

        }


        const returnType =
            this.getExpressionType(
                node.value
            );


        if (
            returnType &&
            this.currentFunction.returnType &&
            returnType !==
                this.currentFunction.returnType
        ) {

            this.addError(
                `Function '${this.currentFunction.name}' ` +
                `should return '${this.currentFunction.returnType}' ` +
                `but got '${returnType}'`,
                node.line || 0
            );

        }


        this.checkExpression(
            node.value
        );

    }


    // ==========================================
    // FUNCTION CALL
    // ==========================================

    checkFunctionCall(node) {

        const functionName =
            node.name ||
            (
                node.callee &&
                node.callee.name
            );


        const argumentsList =
            Array.isArray(node.arguments)
                ? node.arguments
                : [];


        // ======================================
        // BUILT-IN printf()
        // ======================================

        if (
            functionName === "printf"
        ) {

            /*
             * printf must have at least
             * one argument: format string.
             */

            if (
                argumentsList.length === 0
            ) {

                this.addError(
                    "printf expects at least one argument",
                    node.line || 0
                );

                return;

            }


            const formatArgument =
                argumentsList[0];


            if (
                !formatArgument ||
                formatArgument.type !==
                    "Literal" ||
                typeof formatArgument.value !==
                    "string"
            ) {

                this.addError(
                    "First argument of printf must be a string",
                    node.line || 0
                );

            }


            /*
             * Check remaining arguments.
             */

            for (
                let i = 1;
                i < argumentsList.length;
                i++
            ) {

                this.checkExpression(
                    argumentsList[i]
                );

            }


            return;

        }


        // ======================================
        // USER FUNCTION
        // ======================================

        const functionSymbol =
            this.symbolTable.lookup(
                functionName
            );


        if (!functionSymbol) {

            this.addError(
                `Function '${functionName}' is not declared`,
                node.line || 0
            );


            argumentsList.forEach(
                argument =>
                    this.checkExpression(
                        argument
                    )
            );

            return;

        }


        if (
            functionSymbol.kind !==
            "function"
        ) {

            this.addError(
                `'${functionName}' is not a function`,
                node.line || 0
            );

            return;

        }


        /*
         * Function parameters are stored
         * in the scope immediately after
         * the function's global scope.
         */

        const allScopes =
            this.symbolTable.allScopes;


        const parameterScopeIndex =
            functionSymbol.scope + 1;


        let parameters = [];


        if (
            parameterScopeIndex <
            allScopes.length
        ) {

            parameters =
                Object.values(
                    allScopes[
                        parameterScopeIndex
                    ]
                ).filter(
                    symbol =>
                        symbol.kind ===
                        "parameter"
                );

        }


        // Argument count

        if (
            argumentsList.length !==
            parameters.length
        ) {

            this.addError(
                `Function '${functionName}' expects ` +
                `${parameters.length} argument(s) ` +
                `but got ${argumentsList.length}`,
                node.line || 0
            );

        }


        // Argument types

        argumentsList.forEach(
            (argument, index) => {

                const argumentType =
                    this.getExpressionType(
                        argument
                    );


                const parameter =
                    parameters[index];


                if (
                    parameter &&
                    argumentType &&
                    parameter.type &&
                    argumentType !==
                        parameter.type
                ) {

                    this.addError(
                        `Argument ${index + 1} of ` +
                        `function '${functionName}' ` +
                        `should be '${parameter.type}' ` +
                        `but got '${argumentType}'`,
                        node.line || 0
                    );

                }


                this.checkExpression(
                    argument
                );

            }
        );

    }


    // ==========================================
    // IDENTIFIER
    // ==========================================

    checkIdentifier(node) {

        const symbol =
            this.symbolTable.lookup(
                node.name
            );


        if (!symbol) {

            this.addError(
                `Variable '${node.name}' not declared`,
                node.line || 0
            );

        }

    }


    // ==========================================
    // EXPRESSION CHECK
    // ==========================================

    checkExpression(node) {

        if (!node) return;


        switch (node.type) {

            case "Identifier":

                this.checkIdentifier(node);

                break;


            case "Literal":

                break;


            case "BinaryExpression":

                this.checkExpression(
                    node.left
                );

                this.checkExpression(
                    node.right
                );

                break;


            case "UnaryExpression":

                this.checkExpression(
                    node.operand
                );

                break;


            case "CallExpression":

                this.checkFunctionCall(
                    node
                );

                break;

        }

    }


    // ==========================================
    // EXPRESSION TYPE
    // ==========================================

    getExpressionType(node) {

        if (!node) return null;


        switch (node.type) {


            // ----------------------------------
            // LITERAL
            // ----------------------------------

            case "Literal":

                if (
                    typeof node.value ===
                    "number"
                ) {

                    return Number.isInteger(
                        node.value
                    )
                        ? "int"
                        : "float";

                }


                if (
                    typeof node.value ===
                    "boolean"
                ) {

                    return "bool";

                }


                if (
                    typeof node.value ===
                    "string"
                ) {

                    return "string";

                }


                return null;


            // ----------------------------------
            // IDENTIFIER
            // ----------------------------------

            case "Identifier": {

                const symbol =
                    this.symbolTable.lookup(
                        node.name
                    );


                return symbol
                    ? symbol.type
                    : null;

            }


            // ----------------------------------
            // FUNCTION CALL
            // ----------------------------------

            case "CallExpression": {

                const functionName =
                    node.name ||
                    (
                        node.callee &&
                        node.callee.name
                    );


                // Built-in printf returns int

                if (
                    functionName ===
                    "printf"
                ) {

                    return "int";

                }


                const symbol =
                    this.symbolTable.lookup(
                        functionName
                    );


                if (
                    symbol &&
                    symbol.kind === "function"
                ) {

                    return symbol.type;

                }


                return null;

            }


            // ----------------------------------
            // BINARY
            // ----------------------------------

            case "BinaryExpression": {

                const leftType =
                    this.getExpressionType(
                        node.left
                    );


                const rightType =
                    this.getExpressionType(
                        node.right
                    );


                if (
                    node.operator === "==" ||
                    node.operator === "!=" ||
                    node.operator === ">" ||
                    node.operator === "<" ||
                    node.operator === ">=" ||
                    node.operator === "<=" ||
                    node.operator === "&&" ||
                    node.operator === "||"
                ) {

                    return "bool";

                }


                if (
                    node.operator === "+" ||
                    node.operator === "-" ||
                    node.operator === "*" ||
                    node.operator === "/" ||
                    node.operator === "%"
                ) {

                    if (
                        leftType === "float" ||
                        rightType === "float"
                    ) {

                        return "float";

                    }


                    if (
                        leftType === "int" &&
                        rightType === "int"
                    ) {

                        return "int";

                    }

                }


                return (
                    leftType ||
                    rightType
                );

            }


            // ----------------------------------
            // UNARY
            // ----------------------------------

            case "UnaryExpression":

                if (
                    node.operator === "!"
                ) {

                    return "bool";

                }

                return this.getExpressionType(
                    node.operand
                );


            default:

                return null;

        }

    }

}


// ==========================================
// PUBLIC FUNCTION
// ==========================================

function analyzeSemantic(ast) {

    const analyzer =
        new SemanticAnalyzer(ast);

    return analyzer.analyze();

}


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    SemanticAnalyzer,

    analyzeSemantic

};