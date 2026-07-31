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
    // TEMP
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
    // VISIT
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
                        child => this.visit(child)
                    );

                }

                break;


            // ==================================
            // FUNCTION DECLARATION
            // ==================================

            case "FunctionDeclaration": {

                const functionName =
                    node.name ||
                    node.identifier ||
                    "anonymous";


                this.emit(
                    `FUNCTION ${functionName}`
                );


                if (Array.isArray(node.params)) {

                    node.params.forEach(param => {

                        const paramName =
                            param.name ||
                            param.identifier;


                        this.emit(
                            `PARAM ${paramName}`
                        );

                    });

                }


                if (node.body) {

                    this.visit(node.body);

                }


                this.emit(
                    `END FUNCTION ${functionName}`
                );

                break;

            }


            // ==================================
            // MAIN FUNCTION
            // ==================================

            case "MainFunction": {

                const functionName =
                    node.name || "main";


                this.emit(
                    `FUNCTION ${functionName}`
                );


                if (node.body) {

                    this.visit(node.body);

                }


                this.emit(
                    `END FUNCTION ${functionName}`
                );

                break;

            }


            // ==================================
            // BLOCK
            // ==================================

            case "Block":

                if (Array.isArray(node.body)) {

                    node.body.forEach(
                        statement =>
                            this.visit(statement)
                    );

                }

                break;


            // ==================================
            // VARIABLE DECLARATION
            // ==================================

            case "VariableDeclaration": {

                if (node.value) {

                    const value =
                        this.visitExpression(
                            node.value
                        );


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
                    this.visitExpression(
                        node.value
                    );


                this.emit(
                    `${node.identifier} = ${value}`
                );

                break;

            }


            // ==================================
            // PRINT
            // ==================================

            case "PrintStatement": {

                const value =
                    this.visitExpression(
                        node.value
                    );


                this.emit(
                    `PRINT ${value}`
                );

                break;

            }


            // ==================================
            // RETURN
            // ==================================

            case "ReturnStatement": {

                if (node.value) {

                    const value =
                        this.visitExpression(
                            node.value
                        );


                    this.emit(
                        `RETURN ${value}`
                    );

                } else {

                    this.emit(
                        `RETURN`
                    );

                }

                break;

            }


            // ==================================
            // IF
            // ==================================

            case "IfStatement": {

                const condition =
                    this.visitExpression(
                        node.condition
                    );


                const elseLabel =
                    this.newLabel();

                const endLabel =
                    this.newLabel();


                this.emit(
                    `IF_FALSE ${condition} GOTO ${elseLabel}`
                );


                this.visit(
                    node.thenBranch
                );


                this.emit(
                    `GOTO ${endLabel}`
                );


                this.emit(
                    `${elseLabel}:`
                );


                if (node.elseBranch) {

                    this.visit(
                        node.elseBranch
                    );

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
                    this.visitExpression(
                        node.condition
                    );


                this.emit(
                    `IF_FALSE ${condition} GOTO ${endLabel}`
                );


                this.visit(
                    node.body
                );


                this.emit(
                    `GOTO ${startLabel}`
                );


                this.emit(
                    `${endLabel}:`
                );

                break;

            }

        }

    }


    // ==========================================
    // EXPRESSION
    // ==========================================

    visitExpression(node) {

        if (!node) {

            return "";

        }


        switch (node.type) {


            // ==================================
            // LITERAL
            // ==================================

            case "Literal":

                /*
                 * String literals are quoted so that
                 * TAC clearly shows them as strings.
                 */

                if (
                    typeof node.value === "string"
                ) {

                    return `"${node.value}"`;

                }


                return String(node.value);


            // ==================================
            // IDENTIFIER
            // ==================================

            case "Identifier":

                return node.name;


            // ==================================
            // BINARY EXPRESSION
            // ==================================

            case "BinaryExpression": {

                const left =
                    this.visitExpression(
                        node.left
                    );


                const right =
                    this.visitExpression(
                        node.right
                    );


                const temp =
                    this.newTemp();


                this.emit(
                    `${temp} = ${left} ${node.operator} ${right}`
                );


                return temp;

            }

            case "UnaryExpression": {

                const operand =
                    this.visitExpression(
                        node.operand
                    );


                const temp =
                    this.newTemp();


                this.emit(
                    `${temp} = ${node.operator}${operand}`
                );


                return temp;

            }


            case "CallExpression": {

                const functionName =
                    node.name ||
                    (
                        node.callee &&
                        (
                            node.callee.name ||
                            node.callee.identifier
                        )
                    );


                const args =
                    Array.isArray(node.arguments)
                        ? node.arguments
                        : [];


                /*
                 * Evaluate arguments first.
                 */

                const argumentValues =
                    args.map(
                        argument =>
                            this.visitExpression(
                                argument
                            )
                    );


                /*
                 * Emit parameters.
                 */

                argumentValues.forEach(
                    value => {

                        this.emit(
                            `PARAM ${value}`
                        );

                    }
                );


        

                const temp =
                    this.newTemp();


                if (argumentValues.length > 0) {

                    this.emit(
                        `${temp} = CALL ${functionName}, ${argumentValues.length}`
                    );

                } else {

                    this.emit(
                        `${temp} = CALL ${functionName}, 0`
                    );

                }


                return temp;

            }


            default:

                return "";

        }

    }

}


function generateTAC(ast) {

    const generator =
        new TACGenerator(ast);

    return {
        code: generator.generate()
    };

}


module.exports = {

    TACGenerator,

    generateTAC

};