class ProgramExecutor {

    constructor() {

        this.variables = {};

        this.functions = {};

        this.output = [];

        this.returnValue = null;

        this.stopped = false;

    }
    execute(ast) {

        return this.run(ast);

    }

    run(ast) {

        if (!ast) {

            return {
                success: false,
                output: "",
                error: "No AST provided."
            };

        }

        let program = ast;

        if (
            ast.ast &&
            ast.ast.type === "Program"
        ) {

            program = ast.ast;

        }


        if (
            !program ||
            program.type !== "Program"
        ) {

            return {
                success: false,
                output: "",
                error:
                    "Invalid AST: Program node not found."
            };

        }

        this.variables = {};

        this.functions = {};

        this.output = [];

        this.returnValue = null;

        this.stopped = false;

        if (!Array.isArray(program.body)) {

            return {
                success: false,
                output: "",
                error: "Program body not found."
            };

        }

        for (const node of program.body) {

            if (!node) {
                continue;
            }

            if (
                node.type === "FunctionDeclaration"
            ) {

                this.functions[node.name] = node;

            }

        }

        const mainFunction =
            program.body.find(
                node =>
                    node &&
                    (
                        node.type === "MainFunction" ||
                        (
                            node.type === "FunctionDeclaration" &&
                            node.name === "main"
                        )
                    )
            );


        if (!mainFunction) {

            return {
                success: false,
                output: "",
                error: "main function not found"
            };

        }

        try {

            this.visit(mainFunction);


            return {

                success: true,

                output:
                    this.output.join("\n"),

                result:
                    this.returnValue,

                variables:
                    this.variables,

                error: null

            };

        } catch (error) {

            return {

                success: false,

                output:
                    this.output.join("\n"),

                result:
                    this.returnValue,

                variables:
                    this.variables,

                error:
                    error.message

            };

        }

    }

    visit(node) {

        if (!node) {
            return;
        }


        switch (node.type) {

            case "MainFunction":

                if (node.body) {

                    this.visit(node.body);

                }

                break;

            case "FunctionDeclaration":

                break;
            case "Block":

                if (Array.isArray(node.body)) {

                    for (
                        const statement of node.body
                    ) {

                        this.visit(statement);

                        if (this.stopped) {

                            break;

                        }

                    }

                }

                break;

            case "VariableDeclaration":

                this.executeVariableDeclaration(
                    node
                );

                break;

            case "Assignment":

                this.executeAssignment(
                    node
                );

                break;
            case "PrintStatement":

                this.executePrint(
                    node
                );

                break;

            case "IfStatement":

                this.executeIf(
                    node
                );

                break;
            case "WhileStatement":

                this.executeWhile(
                    node
                );

                break;

            case "ReturnStatement":

                this.executeReturn(
                    node
                );

                break;


            default:

                throw new Error(
                    `Unsupported AST node: ${node.type}`
                );

        }

    }

    executeVariableDeclaration(node) {

        let value = null;


        if (node.value) {

            value =
                this.evaluate(
                    node.value
                );

        }


        this.variables[
            node.identifier
        ] = value;

    }

    executeAssignment(node) {

        if (
            !(node.identifier in this.variables)
        ) {

            throw new Error(
                `Variable '${node.identifier}' is not declared.`
            );

        }


        const value =
            this.evaluate(
                node.value
            );


        this.variables[
            node.identifier
        ] = value;

    }

    executePrint(node) {

        const value =
            this.evaluate(
                node.value
            );


        this.output.push(
            String(value)
        );

    }

    executeIf(node) {

        const condition =
            Boolean(
                this.evaluate(
                    node.condition
                )
            );


        if (condition) {

            this.visit(
                node.thenBranch
            );

        }

        else if (node.elseBranch) {

            this.visit(
                node.elseBranch
            );

        }

    }
    executeWhile(node) {

        let counter = 0;

        const MAX_ITERATIONS = 100000;


        while (
            Boolean(
                this.evaluate(
                    node.condition
                )
            )
        ) {

            this.visit(
                node.body
            );


            if (this.stopped) {

                break;

            }


            counter++;


            if (
                counter > MAX_ITERATIONS
            ) {

                throw new Error(
                    "Possible infinite loop detected."
                );

            }

        }

    }

    executeReturn(node) {

        this.returnValue =
            node.value
                ? this.evaluate(node.value)
                : null;


        this.stopped = true;

    }

    evaluate(node) {

        if (!node) {

            return null;

        }
        if (
            node.type === "Literal"
        ) {

            if (
                typeof node.value === "number"
            ) {

                return node.value;

            }


            if (
                typeof node.value === "string" &&
                node.value.trim() !== "" &&
                !isNaN(node.value)
            ) {

                return Number(
                    node.value
                );

            }


            return node.value;

        }
        if (
            node.type === "Identifier"
        ) {

            if (
                !(node.name in this.variables)
            ) {

                throw new Error(
                    `Variable '${node.name}' is not declared.`
                );

            }

            return this.variables[
                node.name
            ];

        }
        if (
            node.type === "CallExpression"
        ) {

            return this.executeFunctionCall(
                node
            );

        }

        if (
            node.type === "UnaryExpression"
        ) {

            const operand =
                this.evaluate(
                    node.operand
                );


            switch (node.operator) {

                case "!":

                    return !operand;


                case "-":

                    return -Number(
                        operand
                    );


                case "+":

                    return Number(
                        operand
                    );


                default:

                    throw new Error(
                        `Unsupported unary operator '${node.operator}'`
                    );

            }

        }

        if (
            node.type === "BinaryExpression"
        ) {

            return this.evaluateBinary(
                node
            );

        }


        throw new Error(
            `Unsupported expression: ${node.type}`
        );

    }
    executeFunctionCall(node) {

        const functionName =
            node.name;


        const functionNode =
            this.functions[
                functionName
            ];


        if (!functionNode) {

            throw new Error(
                `Function '${functionName}' is not declared.`
            );

        }


        const args =
            Array.isArray(node.arguments)
                ? node.arguments
                : [];


        const argumentValues =
            args.map(
                argument =>
                    this.evaluate(argument)
            );


        if (
            argumentValues.length !==
            functionNode.params.length
        ) {

            throw new Error(
                `Function '${functionName}' expects ` +
                `${functionNode.params.length} ` +
                `argument(s), but got ` +
                `${argumentValues.length}.`
            );

        }
        const previousVariables =
            this.variables;

        const previousReturnValue =
            this.returnValue;

        const previousStopped =
            this.stopped;

        this.variables = {};

        this.returnValue = null;

        this.stopped = false;

        for (
            let i = 0;
            i < functionNode.params.length;
            i++
        ) {

            const parameter =
                functionNode.params[i];


            this.variables[
                parameter.name
            ] =
                argumentValues[i];

        }


        try {

            // Execute function body

            this.visit(
                functionNode.body
            );


            return this.returnValue;

        }


        finally {

            // Restore caller context

            this.variables =
                previousVariables;

            this.returnValue =
                previousReturnValue;

            this.stopped =
                previousStopped;

        }

    }
    evaluateBinary(node) {

        const operator =
            node.operator;


        if (operator === "&&") {

            const left =
                Boolean(
                    this.evaluate(
                        node.left
                    )
                );


            if (!left) {

                return false;

            }


            return Boolean(
                this.evaluate(
                    node.right
                )
            );

        }

        if (operator === "||") {

            const left =
                Boolean(
                    this.evaluate(
                        node.left
                    )
                );


            if (left) {

                return true;

            }


            return Boolean(
                this.evaluate(
                    node.right
                )
            );

        }


        const left =
            this.evaluate(
                node.left
            );

        const right =
            this.evaluate(
                node.right
            );


        switch (operator) {

            case "+":

                if (
                    typeof left === "number" &&
                    typeof right === "number"
                ) {

                    return left + right;

                }

                return (
                    String(left) +
                    String(right)
                );

            case "-":

                return (
                    Number(left) -
                    Number(right)
                );

            case "*":

                return (
                    Number(left) *
                    Number(right)
                );

            case "/":

                if (
                    Number(right) === 0
                ) {

                    throw new Error(
                        "Division by zero."
                    );

                }

                return (
                    Number(left) /
                    Number(right)
                );

            case "%":

                if (
                    Number(right) === 0
                ) {

                    throw new Error(
                        "Modulo by zero."
                    );

                }

                return (
                    Number(left) %
                    Number(right)
                );

            case "<":

                return left < right;


            case ">":

                return left > right;


            case "<=":

                return left <= right;


            case ">=":

                return left >= right;

            case "==":

                return left === right;


            case "!=":

                return left !== right;


            default:

                throw new Error(
                    `Unsupported operator '${operator}'`
                );

        }

    }

}

function executeProgram(ast) {

    const executor =
        new ProgramExecutor();

    return executor.run(ast);

}

module.exports = {

    ProgramExecutor,

    executeProgram

};