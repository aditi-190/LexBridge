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
                this.visitProgram(node);
                break;

            case "MainMethod":
                this.visit(node.body);
                break;

            case "Block":
                this.visitBlock(node);
                break;

            case "VariableDeclaration":
                this.visitVariableDeclaration(node);
                break;

            case "Assignment":
                this.visitAssignment(node);
                break;

            case "BinaryExpression":
                this.visitBinaryExpression(node);
                break;

            case "Identifier":
                this.visitIdentifier(node);
                break;

            case "Literal":
                break;

            default:
                break;

        }

    }

    visitProgram(node) {

        for (const method of node.body) {

            this.visit(method);

        }

    }

    visitBlock(node) {

        for (const statement of node.body) {

            this.visit(statement);

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

                message: `Variable '${node.identifier}' is not declared`

            });

        }

        if (node.value) {

            this.visit(node.value);

        }

    }

    visitBinaryExpression(node) {

        this.visit(node.left);

        this.visit(node.right);

    }

    visitIdentifier(node) {

        if (!this.symbolTable[node.name]) {

            this.errors.push({

                message: `Variable '${node.name}' is not declared`

            });

        }

    }

}

function analyzeJava(ast) {

    const analyzer = new SemanticAnalyzer(ast);

    return analyzer.analyze();

}
module.exports = {

    analyzeJava

};