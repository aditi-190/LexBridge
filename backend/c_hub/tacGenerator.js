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
            // INCLUDE DIRECTIVE
            // ==================================

            case "IncludeDirective":

                /*
                 * Include is a preprocessing directive.
                 * Keep it visible in TAC for debugging.
                 */

                this.emit(
                    `INCLUDE <${node.header}>`
                );

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
// FUNCTION CALL
// ==================================

case "CallExpression": {

    // standalone function call
    this.visitExpression(node);

    break;
}

// ----------------------------------
// SCANF INPUT
// ----------------------------------

case "ScanfStatement": {

    this.emit(
        `READ ${node.variable}`
    );

    break;

}


            // ==================================
            // CUSTOM PRINT
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

                }

                else {

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
              case "ForStatement":
            case "Literal": {

                /*
                 * Keep strings quoted in TAC.
                 */

                if (
                    typeof node.value ===
                    "string"
                ) {

                    return `"${this.escapeString(
                        node.value
                    )}"`;

                }


                if (
                    typeof node.value ===
                    "boolean"
                ) {

                    return node.value
                        ? "true"
                        : "false";

                }


                return String(
                    node.value
                );

            }


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


            // ==================================
            // UNARY EXPRESSION
            // ==================================

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


            // ==================================
            // FUNCTION CALL
            // ==================================

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
                    Array.isArray(
                        node.arguments
                    )
                        ? node.arguments
                        : [];


                // ==================================
                // REAL C printf()
                // ==================================

                if (
                    functionName === "printf"
                ) {

                    if (
                        args.length === 0
                    ) {

                        this.emit(
                            `PRINTF`
                        );

                        return "";

                    }


                    /*
                     * First argument is the
                     * printf format string.
                     */

                    const format =
                        this.visitExpression(
                            args[0]
                        );


                    /*
                     * Remaining arguments.
                     */

                    const values =
                        args
                            .slice(1)
                            .map(
                                argument =>
                                    this.visitExpression(
                                        argument
                                    )
                            );


                    if (
                        values.length === 0
                    ) {

                        this.emit(
                            `PRINTF ${format}`
                        );

                    }

                    else {

                        this.emit(
                            `PRINTF ${format}, ${values.join(", ")}`
                        );

                    }


                    /*
                     * C printf returns int.
                     *
                     * For now we don't need
                     * the return value for normal
                     * standalone printf usage.
                     */

                    return "";

                }


                // ==================================
                // USER-DEFINED FUNCTION CALL
                // ==================================

                const argumentValues =
                    args.map(
                        argument =>
                            this.visitExpression(
                                argument
                            )
                    );


                /*
                 * Pass parameters.
                 */

                argumentValues.forEach(
                    value => {

                        this.emit(
                            `PARAM ${value}`
                        );

                    }
                );


                /*
                 * Function returns a value.
                 */

                const temp =
                    this.newTemp();


                this.emit(
                    `${temp} = CALL ${functionName}, ${argumentValues.length}`
                );


                return temp;

            }


            default:

                return "";

        }

    }


    // ==========================================
    // ESCAPE STRING
    // ==========================================

    escapeString(value) {

        return String(value)
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"');

    }

}


// ==========================================
// PUBLIC FUNCTION
// ==========================================

function generateTAC(ast) {

    const generator =
        new TACGenerator(ast);


    return {

        code:
            generator.generate()

    };

}


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    TACGenerator,

    generateTAC

};