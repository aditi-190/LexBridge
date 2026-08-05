class ProgramExecutor {

    constructor(input = "") {

        this.variables = {};

        this.functions = {};

        this.output = [];

        this.returnValue = null;

        this.stopped = false;
         this.inputs = input.trim()
        ? input.trim().split(/\s+/)
        : [];

    this.inputIndex = 0;

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

                error: "Invalid AST"

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

                error: "Program body missing"

            };

        }

        // Register Functions

      // Register Functions

for (const node of program.body) {

    if (!node) continue;

    if (
        node.type === "FunctionDeclaration" ||
        node.type === "MainFunction"
    ) {

        this.functions[node.name || "main"] = node;

    }

}

        // Find main()

        const mainFunction = program.body.find(

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

                error: "main() not found"

            };

        }

        try {

            this.visit(mainFunction);

            return {

                success: true,

                output: this.output.join("\n"),

                result: this.returnValue,

                variables: this.variables,

                error: null

            };

        }

        catch (err) {

            return {

                success: false,

                output: this.output.join("\n"),

                result: this.returnValue,

                variables: this.variables,

                error: err.message

            };

        }

    }

    visit(node) {

        if (!node) return;

        switch (node.type) {

            case "MainFunction":

                this.visit(node.body);

                break;

            case "FunctionDeclaration":

                break;

            case "Block":

                for (const statement of node.body) {

                    this.visit(statement);

                    if (this.stopped)

                        break;

                }

                break;
            case "ExpressionStatement":

    this.evaluate(node.expression);

    break;

            case "VariableDeclaration":

                this.executeVariableDeclaration(node);

                break;

            case "Assignment":

                this.executeAssignment(node);

                break;

            case "CoutStatement":

                this.executeCout(node);

                break;

            case "CinStatement":

                this.executeCin(node);

                break;

            case "ReturnStatement":

                this.executeReturn(node);

                break;

            case "WhileStatement":
                 this.executeWhile(node);
                  break;

            case "ForStatement":

             this.executeFor(node);

                 break;

            case "IfStatement": 

            this.executeIf(node);

             break;

            default:

                throw new Error(

                    `Unsupported node ${node.type}`

                );

        }

    }
    // ==========================================
// VARIABLE DECLARATION
// ==========================================

executeVariableDeclaration(node) {

    let value = null;

    if (node.value) {

        value = this.evaluate(node.value);

    }

    this.variables[node.identifier] = value;

}

// ==========================================
// ASSIGNMENT
// ==========================================

executeAssignment(node) {

    if (!(node.identifier in this.variables)) {

        throw new Error(
            `Variable '${node.identifier}' is not declared.`
        );

    }

    const value = this.evaluate(node.value);

    this.variables[node.identifier] = value;

}

// ==========================================
// COUT
// ==========================================

executeCout(node) {

    console.log("executeCout called");

    const values = [];

    for (const item of node.values) {

        // endl support
        if (
            item.type === "Endl"
        ) {

            this.output.push(
                values.join("")
            );

            values.length = 0;

            continue;

        }

        values.push(
            String(
                this.evaluate(item)
            )
        );

    }

    if (values.length > 0) {

        this.output.push(
            values.join("")
        );

    }

}

// ==========================================
// CIN
// ==========================================

executeCin(node) {

    for (const variable of node.variables) {

        if (!(variable in this.variables)) {

            throw new Error(
                `Variable '${variable}' is not declared.`
            );

        }

        const value = this.inputs[this.inputIndex++] ?? 0;

this.variables[variable] = Number(value);

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

executeFor(node) {

    if (node.initialization) {

    if (node.initialization.type === "VariableDeclaration") {

        this.executeVariableDeclaration(node.initialization);

    }

    else if (node.initialization.type === "Assignment") {

        this.executeAssignment(node.initialization);

    }

}
    while (

        !node.condition ||

        this.evaluate(node.condition)

    ) {

        this.visit(node.body);

        if (this.stopped) {

            break;

        }

        if (node.update) {

            if (node.update.type === "UpdateExpression") {

                const name = node.update.identifier;

                if (!(name in this.variables)) {

                    throw new Error(
                        `Variable '${name}' is not declared.`
                    );

                }

                if (node.update.operator === "++") {

                    this.variables[name]++;

                }

                else {

                    this.variables[name]--;

                }

            }

            else if (node.update.type === "Assignment") {

                this.executeAssignment(node.update);

            }

        }

    }

}
executeWhile(node) { 

    while (this.evaluate(node.condition)) {

        this.visit(node.body); 

        if (this.stopped) 
            { 
                break;
             } 
            } 
        }
executeIf(node) { 

    if (this.evaluate(node.condition)) { 

        this.visit(node.thenBranch);

     } 

     else if (node.elseBranch) {

         this.visit(node.elseBranch); 

        }
     }
// ==========================================
// EVALUATE EXPRESSION
// ==========================================

evaluate(node) {

    if (!node) return null;

    switch (node.type) {

        case "Literal":

            return node.value;

        case "Identifier":

            if (!(node.name in this.variables)) {

                throw new Error(
                    `Variable '${node.name}' is not declared.`
                );

            }

            return this.variables[node.name];

        case "BinaryExpression":

            return this.evaluateBinary(node);

        case "CallExpression":

            return this.executeFunctionCall(node);

        default:

            throw new Error(
                `Unsupported expression '${node.type}'`
            );

    }

}

// ==========================================
// FUNCTION CALL
// ==========================================

executeFunctionCall(node) {

    const func = this.functions[node.name];

    if (!func) {

        throw new Error(
            `Function '${node.name}' not found.`
        );

    }

    const oldVariables = { ...this.variables };

    const oldReturn = this.returnValue;

    const oldStopped = this.stopped;

    this.returnValue = null;
    this.stopped = false;

    // Parameter Binding

    for (let i = 0; i < func.params.length; i++) {

        const parameter = func.params[i];

        const argument = node.arguments[i];

        this.variables[parameter.name] =
            this.evaluate(argument);

    }

    this.visit(func.body);

    const value = this.returnValue;

    this.variables = oldVariables;

    this.returnValue = oldReturn;

    this.stopped = oldStopped;

    return value;

}

// ==========================================
// BINARY EXPRESSION
// ==========================================

evaluateBinary(node) {

    const left = this.evaluate(node.left);

    const right = this.evaluate(node.right);

    switch (node.operator) {

        case "+":
            return left + right;

        case "-":
            return left - right;

        case "*":
            return left * right;

        case "/":

            if (right == 0) {

                throw new Error(
                    "Division by zero."
                );

            }

            return left / right;

        case "%":

            return left % right;

        case "<":

            return left < right;

        case ">":

            return left > right;

        case "<=":

            return left <= right;

        case ">=":

            return left >= right;

        case "==":

            return left == right;

        case "!=":

            return left != right;

        case "&&":

            return left && right;

        case "||":

            return left || right;

        default:

            throw new Error(
                `Unknown operator '${node.operator}'`
            );

    }

}

}

// ==========================================
// EXECUTE PROGRAM
// ==========================================

function executeProgram(ast, input = "") {

    const executor =
        new ProgramExecutor(input);

    return executor.run(ast);

}
module.exports = {

    ProgramExecutor,

    executeProgram

};