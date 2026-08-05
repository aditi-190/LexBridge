class SymbolTable {

    constructor() {

        this.scopes = [];
        this.allScopes = [];

        // Global Scope
        this.enterScope();

    }

    enterScope() {

        const scope = {};

        this.scopes.push(scope);
        this.allScopes.push(scope);

    }

    exitScope() {

        if (this.scopes.length > 1) {

            this.scopes.pop();

        }

    }

    currentScope() {

        return this.scopes[
            this.scopes.length - 1
        ];

    }

    declare(name, type, line, kind = "variable") {

        const scope = this.currentScope();

        if (scope[name]) {

            const symbolType =
                kind === "function"
                    ? "Function"
                    : kind === "parameter"
                        ? "Parameter"
                        : "Variable";

            return {

                success: false,

                error: `${symbolType} '${name}' already declared`

            };

        }

        scope[name] = {

            name,

            type,

            kind,

            scope: this.allScopes.indexOf(scope),

            lineDeclared: line

        };

        return {

            success: true,

            error: null

        };

    }

    lookup(name) {

        for (

            let i = this.scopes.length - 1;

            i >= 0;

            i--

        ) {

            if (this.scopes[i][name]) {

                return this.scopes[i][name];

            }

        }

        return null;

    }

    existsInCurrentScope(name) {

        return Boolean(
            this.currentScope()[name]
        );

    }

    getAllSymbols() {

        const result = {};

        this.allScopes.forEach((scope, index) => {

            result[`scope_${index}`] = scope;

        });

        return result;

    }

}

function buildSymbolTable(ast) {

    const table = new SymbolTable();

    const errors = [];

    function addError(message, line = 0) {

        errors.push({
            message,
            line
        });

    }

    function visit(node) {

        if (!node) return;

        switch (node.type) {

            case "Program":

                if (Array.isArray(node.body)) {

                    node.body.forEach(visit);

                }

                break;

            case "FunctionDeclaration": {

                const result = table.declare(

                    node.name,

                    node.returnType || "int",

                    node.line || 0,

                    "function"

                );

                if (!result.success) {

                    addError(result.error, node.line || 0);

                }

                table.enterScope();

                if (Array.isArray(node.params)) {

                    node.params.forEach(param => {

                        const p = table.declare(

                            param.name,

                            param.dataType,

                            param.line || 0,

                            "parameter"

                        );

                        if (!p.success) {

                            addError(p.error, param.line || 0);

                        }

                    });

                }

                if (node.body) {

                    visit(node.body);

                }

                table.exitScope();

                break;

            }

            case "MainFunction": {

                table.declare(

                    "main",

                    "int",

                    node.line || 0,

                    "function"

                );

                table.enterScope();

                if (node.body) {

                    visit(node.body);

                }

                table.exitScope();

                break;

            }

            case "Block":

                table.enterScope();

                if (Array.isArray(node.body)) {

                    node.body.forEach(visit);

                }

                table.exitScope();

                break;

            case "VariableDeclaration": {

                const result = table.declare(

                    node.identifier,

                    node.dataType,

                    node.line || 0,

                    "variable"

                );

                if (!result.success) {

                    addError(result.error, node.line || 0);

                }

                if (node.value) {

                    visit(node.value);

                }

                break;

            }

            case "Assignment":

                if (node.value) {

                    visit(node.value);

                }

                break;

            case "CoutStatement":

                if (Array.isArray(node.values)) {

                    node.values.forEach(visit);

                }

                break;

            case "CinStatement":

                if (Array.isArray(node.variables)) {

                    node.variables.forEach(visit);

                }

                break;

            case "ReturnStatement":

                if (node.value) {

                    visit(node.value);

                }

                break;

            case "IfStatement":

                visit(node.condition);

                visit(node.thenBranch);

                if (node.elseBranch) {

                    visit(node.elseBranch);

                }

                break;

            case "WhileStatement":

                visit(node.condition);

                visit(node.body);

                break;

            case "CallExpression":

                if (Array.isArray(node.arguments)) {

                    node.arguments.forEach(visit);

                }

                break;

            case "BinaryExpression":

                visit(node.left);

                visit(node.right);

                break;

            case "UnaryExpression":

                visit(node.operand);

                break;

            case "Identifier":

                break;

            case "Literal":

                break;

        }

    }

    visit(ast);

    return {

        symbolTable: table.getAllSymbols(),

        errors

    };

}

module.exports = {

    SymbolTable,

    buildSymbolTable

};