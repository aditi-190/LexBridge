class SemanticAnalyzer {

    constructor(ast) {

        this.ast = ast;

        this.symbolTable = {};

        this.errors = [];

    }

    analyze() {

        this.visit(this.ast);

        return {

            symbolTable: this.symbolTable,

            errors: this.errors

        };

    }

    visit(node) {

        if (!node) return;

        switch (node.type) {

            case "Program":

                node.body.forEach(statement => {

                    this.visit(statement);

                });

                break;

            case "VariableDeclaration":

                this.visitVariableDeclaration(node);

                break;

            case "Assignment":

                this.visitAssignment(node);

                break;

            case "BinaryExpression":

                this.visit(node.left);

                this.visit(node.right);

                break;

            case "Identifier":

                this.visitIdentifier(node);

                break;

        }

    }

    visitVariableDeclaration(node) {

        if (this.symbolTable[node.identifier]) {

            this.errors.push({

                message: `Variable '${node.identifier}' already declared`

            });

            return;

        }

        this.symbolTable[node.identifier] = {

            type: node.dataType

        };

        if (node.value) {

            this.visit(node.value);

        }

    }

    visitAssignment(node) {

        if (!this.symbolTable[node.identifier]) {

            this.errors.push({

                message: `Variable '${node.identifier}' not declared`

            });

        }

        this.visit(node.value);

    }

    visitIdentifier(node) {

        if (!this.symbolTable[node.name]) {

            this.errors.push({

                message: `Variable '${node.name}' not declared`

            });

        }

    }

}

function analyzeSemantic(ast) {

    const analyzer = new SemanticAnalyzer(ast);

    return analyzer.analyze();

}

module.exports = {

    analyzeSemantic

};