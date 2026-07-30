class TACGenerator {

    constructor() {

        this.code = [];

        this.tempCount = 0;

        this.labelCount = 0;

    }

    newTemp() {

        this.tempCount++;

        return `t${this.tempCount}`;

    }

    newLabel() {

        this.labelCount++;

        return `L${this.labelCount}`;

    }

    emit(instruction) {

        this.code.push(instruction);

    }

    generate(ast) {

        this.visit(ast);

        return {

            code: this.code

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

                node.body.forEach(
                    statement => this.visit(statement)
                );

                break;

            case "VariableDeclaration":

                if (node.value) {

                    const value = this.generateExpression(
                        node.value
                    );

                    this.emit(
                        `${node.identifier} = ${value}`
                    );

                }

                break;

            case "Assignment":

                {

                    const value = this.generateExpression(
                        node.value
                    );

                    this.emit(
                        `${node.identifier} = ${value}`
                    );

                }

                break;

            case "PrintStatement":

                {

                    const value = this.generateExpression(
                        node.value
                    );

                    this.emit(
                        `print ${value}`
                    );

                }

                break;

            case "ReturnStatement":

                {

                    const value = this.generateExpression(
                        node.value
                    );

                    this.emit(
                        `return ${value}`
                    );

                }

                break;

            case "IfStatement":

                this.generateIf(node);

                break;

            case "WhileStatement":

                this.generateWhile(node);

                break;

        }

    }

    generateExpression(node) {

        if (!node) {

            return "";

        }

        if (node.type === "Literal") {

            return String(node.value);

        }

        if (node.type === "Identifier") {

            return node.name;

        }

        if (node.type === "UnaryExpression") {

            const operand = this.generateExpression(
                node.operand
            );

            const temp = this.newTemp();

            this.emit(
                `${temp} = ${node.operator}${operand}`
            );

            return temp;

        }

        if (node.type === "BinaryExpression") {

            const left = this.generateExpression(
                node.left
            );

            const right = this.generateExpression(
                node.right
            );

            const temp = this.newTemp();

            this.emit(
                `${temp} = ${left} ${node.operator} ${right}`
            );

            return temp;

        }

        return "";

    }

    generateIf(node) {

        const elseLabel = this.newLabel();

        const endLabel = this.newLabel();

        const condition = this.generateExpression(
            node.condition
        );

        this.emit(
            `ifFalse ${condition} goto ${elseLabel}`
        );

        this.visit(node.thenBranch);

        this.emit(
            `goto ${endLabel}`
        );

        this.emit(
            `${elseLabel}:`
        );

        if (node.elseBranch) {

            this.visit(node.elseBranch);

        }

        this.emit(
            `${endLabel}:`
        );

    }

    generateWhile(node) {

        const startLabel = this.newLabel();

        const endLabel = this.newLabel();

        this.emit(
            `${startLabel}:`
        );

        const condition = this.generateExpression(
            node.condition
        );

        this.emit(
            `ifFalse ${condition} goto ${endLabel}`
        );

        this.visit(node.body);

        this.emit(
            `goto ${startLabel}`
        );

        this.emit(
            `${endLabel}:`
        );

    }

}

function generateTAC(ast) {

    const generator = new TACGenerator();

    return generator.generate(ast);

}

module.exports = {

    TACGenerator,

    generateTAC

};