class ProgramExecutor {

    constructor() {

        this.variables = {};

        this.functions = {};

        this.output = [];

        this.returnValue = null;

        this.stopped = false;

        this.input = [];
          this.inputIndex = 0;

    }


    // ==========================================
    // EXECUTE
    // ==========================================

   execute(ast, input = "") {

    return this.run(ast, input);

}


    // ==========================================
    // RUN
    // ==========================================

    run(ast, input = "") {

    this.input = input
        .toString()
        .trim()
        .split(/\s+/)
        .filter(x => x !== "");

    this.inputIndex = 0;

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


        // Collect functions

        for (const node of program.body) {

            if (
                node &&
                node.type === "FunctionDeclaration"
            ) {

                this.functions[node.name] = node;

            }

        }


        // Find main()

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
                error: "main function not found."

            };

        }


        try {

            this.visit(mainFunction);


            return {

                success: true,

              output: this.output.join(""),

                result:
                    this.returnValue,

                variables:
                    this.variables,

                error: null

            };

        }

        catch (error) {

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


    // ==========================================
    // VISITOR
    // ==========================================

    visit(node) {

        if (!node) return;


        switch (node.type) {

            case "ForStatement":

    this.executeFor(node);

    break;

    case "DoWhileStatement":

    this.executeDoWhile(node);

    break;

    case "ScanfStatement":

    this.executeScanf(node);

    break;
    


            case "MainFunction":

                this.visit(node.body);

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
    


            case "IncludeDirective":

                // #include <stdio.h>
                // No runtime action needed.

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
                case "CallExpression":

    this.evaluate(node);

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

        }

    }


    // ==========================================
    // VARIABLE DECLARATION
    // ==========================================

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

    executeDoWhile(node) {


    let counter = 0;

    const MAX_ITERATIONS = 100000;


    do {


        this.visit(node.body);


        if(this.stopped){

            break;

        }


        counter++;


        if(counter > MAX_ITERATIONS){

            throw new Error(
                "Possible infinite loop detected."
            );

        }


    }
    while(
        Boolean(
            this.evaluate(
                node.condition
            )
        )
    );


}
// ==========================================
// FOR LOOP
// ==========================================

executeFor(node) {


    // initialization

    this.visit(
        node.initialization
    );


    let counter = 0;

    const MAX_ITERATIONS = 100000;


    while (

        Boolean(
            this.evaluate(
                node.condition
            )

        )

    ) {


        // body

        this.visit(
            node.body
        );


        if (this.stopped) {

            break;

        }


        // update

        this.visit(
            node.update
        );


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
executeScanf(node){

    if(
        this.inputIndex >= this.input.length
    ){

        throw new Error(
            "Input not provided"
        );

    }


    const value =
        Number(
            this.input[this.inputIndex]
        );


    this.inputIndex++;


    this.variables[node.variable] =
        value;

}


    // ==========================================
    // ASSIGNMENT
    // ==========================================

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


    // ==========================================
    // CUSTOM PRINT
    // ==========================================

    executePrint(node) {

        const value =
            this.evaluate(
                node.value
            );


        this.output.push(
            String(value)
        );

    }


    // ==========================================
    // IF
    // ==========================================

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


    // ==========================================
    // WHILE
    // ==========================================

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

            this.visit(node.body);


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


    // ==========================================
    // RETURN
    // ==========================================

    executeReturn(node) {

        this.returnValue =
            node.value
                ? this.evaluate(node.value)
                : null;


        this.stopped = true;

    }


    // ==========================================
    // EVALUATE
    // ==========================================

    evaluate(node) {

        if (!node) {

            return null;

        }


        // Literal

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


        // Identifier

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


        // Function call

        if (
            node.type === "CallExpression"
        ) {

            return this.executeFunctionCall(
                node
            );

        }


        // Unary

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

                    return -Number(operand);

                case "+":

                    return Number(operand);

                default:

                    throw new Error(
                        `Unsupported unary operator '${node.operator}'`
                    );

            }

        }


        // Binary

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


    // ==========================================
    // FUNCTION CALL
    // ==========================================

    executeFunctionCall(node) {

        const functionName =
            node.name;


        // Built-in printf()

        if (
            functionName === "printf"
        ) {

            return this.executePrintf(
                node
            );

        }


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
                `${functionNode.params.length} argument(s), ` +
                `but got ${argumentValues.length}.`
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

            this.visit(
                functionNode.body
            );


            return this.returnValue;

        }

        finally {

            this.variables =
                previousVariables;

            this.returnValue =
                previousReturnValue;

            this.stopped =
                previousStopped;

        }

    }


    // ==========================================
    // REAL printf()
    // ==========================================

    executePrintf(node) {

        const args =
            Array.isArray(node.arguments)
                ? node.arguments
                : [];


        if (args.length === 0) {

            return 0;

        }


        const format =
            this.evaluate(
                args[0]
            );


        if (
            typeof format !== "string"
        ) {

            throw new Error(
                "printf first argument must be a string."
            );

        }


        const values =
            args
                .slice(1)
                .map(
                    argument =>
                        this.evaluate(argument)
                );


        const output =
            this.formatPrintf(
                format,
                values
            );


        this.output.push(
            output
        );


        // C printf returns number of characters
        return output.length;

    }


    // ==========================================
    // FORMAT printf STRING
    // ==========================================

    formatPrintf(format, values) {

        let index = 0;


        let result = "";


        for (
            let i = 0;
            i < format.length;
            i++
        ) {

            const ch =
                format[i];


            // Escape sequence

            if (
                ch === "\\" &&
                i + 1 < format.length
            ) {

                const next =
                    format[i + 1];


                if (next === "n") {

                    result += "\n";

                    i++;

                    continue;

                }


                if (next === "t") {

                    result += "\t";

                    i++;

                    continue;

                }


                if (next === "\\") {

                    result += "\\";

                    i++;

                    continue;

                }


                if (next === '"') {

                    result += '"';

                    i++;

                    continue;

                }


                result += next;

                i++;

                continue;

            }


            // Format specifier

            if (
                ch === "%" &&
                i + 1 < format.length
            ) {

                const specifier =
                    format[i + 1];


                const value =
                    values[index];


                switch (specifier) {


                    case "d":
                    case "i":

                        result +=
                            Number(value);

                        index++;

                        i++;

                        continue;


                    case "f":

                        result +=
                            Number(value);

                        index++;

                        i++;

                        continue;


                    case "s":

                        result +=
                            String(value);

                        index++;

                        i++;

                        continue;


                    case "c":

                        result +=
                            String(value)
                                .charAt(0);

                        index++;

                        i++;

                        continue;


                    case "%":

                        result += "%";

                        i++;

                        continue;


                    default:

                        result += "%";

                }

            }


            result += ch;

        }


        return result;

    }


    // ==========================================
    // BINARY EXPRESSION
    // ==========================================

    evaluateBinary(node) {

        const operator =
            node.operator;


        // &&

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


        // ||

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


// ==========================================
// PUBLIC FUNCTION
// ==========================================

function executeProgram(ast, input = "") {

    const executor = new ProgramExecutor();

    return executor.run(ast, input);

}


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    ProgramExecutor,

    executeProgram

};