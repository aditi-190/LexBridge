class TACGenerator {

    constructor(ast) {

        this.ast = ast;

        this.code = [];

        this.tempCount = 0;

        this.labelCount = 0;

    }

    // ==========================================
    // GENERATE
    // ==========================================

    generate() {

        this.visit(this.ast);

        return this.code;

    }

    // ==========================================
    // TEMP VARIABLE
    // ==========================================

    newTemp() {

        this.tempCount++;

        return `t${this.tempCount}`;

    }

    // ==========================================
    // LABEL
    // ==========================================

    newLabel() {

        this.labelCount++;

        return `L${this.labelCount}`;

    }

    // ==========================================
    // EMIT
    // ==========================================

    emit(instruction) {

        this.code.push(instruction);

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

                    node.body.forEach(child => {

                        this.visit(child);

                    });

                }

                break;

            // ==================================
            // FUNCTION
            // ==================================

            case "FunctionDeclaration": {

                this.emit(`FUNCTION ${node.name}`);

                if (Array.isArray(node.params)) {

                    node.params.forEach(param => {

                        this.emit(`PARAM ${param.name}`);

                    });

                }

                this.visit(node.body);

                this.emit(`END FUNCTION ${node.name}`);

                break;

            }

            // ==================================
            // MAIN
            // ==================================

            case "MainFunction": {

                this.emit("FUNCTION main");

                this.visit(node.body);

                this.emit("END FUNCTION main");

                break;

            }

            // ==================================
            // BLOCK
            // ==================================

            case "Block":

                if (Array.isArray(node.body)) {

                    node.body.forEach(statement => {

                        this.visit(statement);

                    });

                }

                break;

                    // ==================================
            // VARIABLE DECLARATION
            // ==================================

            case "VariableDeclaration": {

                if (node.value) {

                    const value =
                        this.visitExpression(node.value);

                    this.emit(
                        `${node.identifier} = ${value}`
                    );

                }

                break;

            }

            // ==================================
            // ASSIGNMENT
            // ==================================

            case "Assignment": {

                const value =
                    this.visitExpression(node.value);

                this.emit(
                    `${node.identifier} = ${value}`
                );

                break;

            }

            // ==================================
            // COUT
            // ==================================

            case "CoutStatement": {

                if (Array.isArray(node.values)) {

                    node.values.forEach(value => {

                        const result =
                            this.visitExpression(value);

                        this.emit(
                            `PRINT ${result}`
                        );

                    });

                }

                break;

            }

            // ==================================
            // CIN
            // ==================================

            case "CinStatement": {

                if (Array.isArray(node.variables)) {

                    node.variables.forEach(variable => {

                        this.emit(
                            `READ ${variable}`
                        );

                    });

                }

                break;

            }

            // ==================================
            // RETURN
            // ==================================

            case "ReturnStatement": {

                if (node.value) {

                    const value =
                        this.visitExpression(node.value);

                    this.emit(
                        `RETURN ${value}`
                    );

                }

                else {

                    this.emit("RETURN");

                }

                break;

            }

            // ==================================
            // IF
            // ==================================

            case "IfStatement": {

                const condition =
                    this.visitExpression(node.condition);

                const elseLabel =
                    this.newLabel();

                const endLabel =
                    this.newLabel();

                this.emit(
                    `IF_FALSE ${condition} GOTO ${elseLabel}`
                );

                this.visit(node.thenBranch);

                this.emit(
                    `GOTO ${endLabel}`
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

                break;

            }

            // ==================================
            // WHILE
            // ==================================

            case "WhileStatement": {

                const startLabel =
                    this.newLabel();

                const endLabel =
                    this.newLabel();

                this.emit(
                    `${startLabel}:`
                );

                const condition =
                    this.visitExpression(node.condition);

                this.emit(
                    `IF_FALSE ${condition} GOTO ${endLabel}`
                );

                this.visit(node.body);

                this.emit(
                    `GOTO ${startLabel}`
                );

                this.emit(
                    `${endLabel}:`
                );

                break;

            }

            //for

        case "ForStatement": {

    this.visit(node.initialization);

    const startLabel = this.newLabel();
    const endLabel = this.newLabel();

    this.emit(`${startLabel}:`);

    const condition =
        this.visitExpression(node.condition);

    this.emit(
        `IF_FALSE ${condition} GOTO ${endLabel}`
    );

    this.visit(node.body);

    this.visit(node.update);

    this.emit(`GOTO ${startLabel}`);

    this.emit(`${endLabel}:`);

    break;
}

case "ExpressionStatement":

    this.visitExpression(node.expression);

    break;

case "IncludeStatement":
    break;

case "UsingNamespace":
    break;
                  // ==================================
            // DEFAULT
            // ==================================

            default:

                break;

        }

    }

    // ==========================================
    // EXPRESSION
    // ==========================================

    visitExpression(node) {

        if (!node) return "";

        switch (node.type) {

            // ==============================
            // LITERAL
            // ==============================

            case "Literal":

                return node.value;

            // ==============================
            // IDENTIFIER
            // ==============================

            case "Identifier":

                return node.name;

            // ==============================
            // BINARY EXPRESSION
            // ==============================

            case "BinaryExpression": {

                const left =
                    this.visitExpression(node.left);

                const right =
                    this.visitExpression(node.right);

                const temp =
                    this.newTemp();

                this.emit(
                    `${temp} = ${left} ${node.operator} ${right}`
                );

                return temp;

            }

            // ==============================
            // UNARY EXPRESSION
            // ==============================

            case "UnaryExpression": {

                const value =
                    this.visitExpression(node.operand);

                const temp =
                    this.newTemp();

                this.emit(
                    `${temp} = ${node.operator}${value}`
                );

                return temp;

            }

            // ==============================
            // FUNCTION CALL
            // ==============================

            case "CallExpression": {

                if (Array.isArray(node.arguments)) {

                    node.arguments.forEach(arg => {

                        const value =
                            this.visitExpression(arg);

                        this.emit(
                            `PARAM ${value}`
                        );

                    });

                }

                const temp =
                    this.newTemp();
                    
                     const argCount = Array.isArray(node.arguments)
        ? node.arguments.length
        : 0;

                this.emit(
                    `${temp} = CALL ${node.name}, ${node.arguments.length}`
                );

                return temp;

            }

            default:

                return "";

        }

    }

}

// ==========================================
// GENERATE TAC
// ==========================================

function generateTAC(ast) {

    const generator =
        new TACGenerator(ast);

    return {

        code: generator.generate()

    };

}

// ==========================================
// EXPORT
// ==========================================

module.exports = {

    TACGenerator,

    generateTAC

};  
