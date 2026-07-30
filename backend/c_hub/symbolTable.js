class SymbolTable {
constructor() {

    this.scopes = [];

    this.allScopes = [];

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

        return this.scopes[this.scopes.length - 1];

    }

    declare(name, type, line) {

        const scope = this.currentScope();

        if (scope[name]) {

            return {

                success: false,

                error: `Variable '${name}' already declared`

            };

        }

        scope[name] = {

            name,

            type,

            scope: this.scopes.length - 1,

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

    function visit(node) {

        if (!node) return;

        switch (node.type) {

            case "Program":

                node.body.forEach(visit);

                break;

            case "MainFunction":

                visit(node.body);

                break;

            case "Block":

                table.enterScope();

                node.body.forEach(visit);

                table.exitScope();

                break;

            case "VariableDeclaration": {

                const result = table.declare(
                    node.identifier,
                    node.dataType,
                    node.line || 0
                );

                if (!result.success) {

                    errors.push({
                        message: result.error,
                        line: node.line || 0
                    });

                }

                if (node.value) {

                    visit(node.value);

                }

                break;
            }

            case "Assignment":

                visit(node.value);

                break;

            case "BinaryExpression":

                visit(node.left);

                visit(node.right);

                break;

            case "UnaryExpression":

                visit(node.operand);

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

            case "PrintStatement":

                visit(node.value);

                break;

            case "ReturnStatement":

                visit(node.value);

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