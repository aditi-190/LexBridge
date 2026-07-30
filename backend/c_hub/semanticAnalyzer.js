const { SymbolTable } = require("./symbolTable");

class SemanticAnalyzer {

    constructor(ast, symbolTableData = null) {

        this.ast = ast;

        this.symbolTable = new SymbolTable();

        this.errors = [];

        if (symbolTableData) {

            this.externalSymbolTable = symbolTableData;

        } else {

            this.externalSymbolTable = null;

        }

    }

    analyze() {

        this.visit(this.ast);

        return {

            errors: this.errors,

            symbolTable: this.symbolTable.getAllSymbols()

        };

    }

    visit(node) {

        if (!node) return;

        switch (node.type) {

            case "Program":

                node.body.forEach(
                    child => this.visit(child)
                );

                break;

            case "MainFunction":

                this.visit(node.body);

                break;

            case "Block":

                this.symbolTable.enterScope();

                node.body.forEach(
                    statement => this.visit(statement)
                );

                this.symbolTable.exitScope();

                break;

            case "VariableDeclaration":

                this.checkDeclaration(node);

                break;

            case "Assignment":

                this.checkAssignment(node);

                break;

            case "IfStatement":

                this.checkIfStatement(node);

                break;

            case "WhileStatement":

                this.checkWhileStatement(node);

                break;

            case "PrintStatement":

                this.checkExpression(node.value);

                break;

            case "ReturnStatement":

                this.checkExpression(node.value);

                break;

            case "BinaryExpression":

                this.checkExpression(node);

                break;

            case "UnaryExpression":

                this.checkExpression(node);

                break;

            case "Identifier":

                this.checkIdentifier(node);

                break;

            case "Literal":

                break;

        }

    }

    checkDeclaration(node) {

        const result = this.symbolTable.declare(

            node.identifier,

            node.dataType,

            node.line || 0

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

    checkAssignment(node) {

        const symbol = this.symbolTable.lookup(
            node.identifier
        );

        if (!symbol) {

            this.errors.push({

                message:
                    `Variable '${node.identifier}' not declared`

            });

            this.checkExpression(node.value);

            return;

        }

        this.checkExpression(node.value);

    }

    checkIdentifier(node) {

        const symbol = this.symbolTable.lookup(
            node.name
        );

        if (!symbol) {

            this.errors.push({

                message:
                    `Variable '${node.name}' not declared`

            });

        }

    }

    checkIfStatement(node) {

        this.checkExpression(node.condition);

        this.visit(node.thenBranch);

        if (node.elseBranch) {

            this.visit(node.elseBranch);

        }

    }

    checkWhileStatement(node) {

        this.checkExpression(node.condition);

        this.visit(node.body);

    }

    checkExpression(node) {

        if (!node) return;

        switch (node.type) {

            case "Identifier":

                this.checkIdentifier(node);

                break;

            case "Literal":

                break;

            case "BinaryExpression":

                this.checkExpression(node.left);

                this.checkExpression(node.right);

                break;

            case "UnaryExpression":

                this.checkExpression(node.operand);

                break;

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