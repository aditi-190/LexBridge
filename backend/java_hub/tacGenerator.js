class TACGenerator {
    constructor() {
        this.instructions = [];
        this.tempCount = 1;
        this.labelCount = 1;
        this.breakLabelStack = [];
    }

    newTemp() {
        return `t${this.tempCount++}`;
    }

    newLabel() {
        return `L${this.labelCount++}`;
    }

    emit(op, arg1 = "", arg2 = "", result = "") {
        this.instructions.push({ op, arg1, arg2, result });
    }

    generate(ast) {
        this.instructions = [];
        this.tempCount = 1;
        this.labelCount = 1;
        this.breakLabelStack = [];

        if (ast && ast.type === "Program") {
            const hasMain = ast.body.some(
                (s) => s.type === "FunctionDeclaration" && s.name === "main"
            );
            if (hasMain) {
                this.emit("GOTO", "", "", "main");
            }

            for (const stmt of ast.body) {
                this.generateStatement(stmt);
            }
        }
        return this.instructions;
    }

    isScannerRead(node) {
        if (!node) return false;
        if (node.type === "ScannerRead") return true;
        if (node.type === "FunctionCall" && node.name && node.name.startsWith("sc.")) return true;
        return false;
    }

    generateStatement(node) {
        if (!node) return;

        switch (node.type) {
            case "VariableDeclaration": {
                const varName = node.identifier || node.name;
                if (node.value) {
                    if (this.isScannerRead(node.value)) {
                        this.emit("CALL", "input", 0, varName);
                    } else {
                        const val = this.generateExpression(node.value);
                        this.emit("=", val, "", varName);
                    }
                } else {
                    this.emit("DECLARE", node.dataType || "int", "", varName);
                }
                break;
            }

            case "Assignment": {
                const varName = node.identifier || node.name;
                if (this.isScannerRead(node.value)) {
                    this.emit("CALL", "input", 0, varName);
                } else {
                    const val = this.generateExpression(node.value);
                    this.emit("=", val, "", varName);
                }
                break;
            }

            case "ScannerInit":
                break;

            case "FunctionDeclaration": {
                const afterLabel = this.newLabel();
                this.emit("GOTO", "", "", afterLabel);

                this.emit("LABEL", "", "", node.name);
                if (node.params && Array.isArray(node.params)) {
                    for (const param of node.params) {
                        const paramName = typeof param === 'string' 
                            ? param 
                            : (param.identifier || param.name || param.id || param.varName);
                            
                        const paramType = (typeof param === 'object' && (param.dataType || param.type)) 
                            ? (param.dataType || param.type) 
                            : "int";

                        if (paramName) {
                            this.emit("PARAM_DECL", paramType, "", paramName);
                        }
                    }
                }
                if (node.body) {
                    this.generateStatement(node.body);
                }
                this.emit("END_FUNC", "", "", node.name);

                this.emit("LABEL", "", "", afterLabel);
                break;
            }

            case "IfStatement": {
                const cond = this.generateExpression(node.condition);
                const elseLabel = this.newLabel();
                const endLabel = this.newLabel();

                this.emit("IFFALSE", cond, "", elseLabel);

                this.generateStatement(node.thenBranch);

                if (node.elseBranch) {
                    this.emit("GOTO", "", "", endLabel);
                    this.emit("LABEL", "", "", elseLabel);
                    this.generateStatement(node.elseBranch);
                    this.emit("LABEL", "", "", endLabel);
                } else {
                    this.emit("LABEL", "", "", elseLabel);
                }
                break;
            }

            case "WhileStatement": {
                const startLabel = this.newLabel();
                const endLabel = this.newLabel();
                this.breakLabelStack.push(endLabel);

                this.emit("LABEL", "", "", startLabel);
                const cond = this.generateExpression(node.condition);

                this.emit("IFFALSE", cond, "", endLabel);
                this.generateStatement(node.body);
                this.emit("GOTO", "", "", startLabel);

                this.emit("LABEL", "", "", endLabel);
                this.breakLabelStack.pop();
                break;
            }

            case "DoWhileStatement": {
                const startLabel = this.newLabel();
                const endLabel = this.newLabel();
                this.breakLabelStack.push(endLabel);

                this.emit("LABEL", "", "", startLabel);
                this.generateStatement(node.body);

                const cond = this.generateExpression(node.condition);
                this.emit("IFFALSE", cond, "", endLabel);
                this.emit("GOTO", "", "", startLabel);

                this.emit("LABEL", "", "", endLabel);
                this.breakLabelStack.pop();
                break;
            }

            case "ForStatement": {
                const startLabel = this.newLabel();
                const endLabel = this.newLabel();
                this.breakLabelStack.push(endLabel);

                if (node.init) this.generateStatement(node.init);

                this.emit("LABEL", "", "", startLabel);
                if (node.condition) {
                    const cond = this.generateExpression(node.condition);
                    this.emit("IFFALSE", cond, "", endLabel);
                }

                this.generateStatement(node.body);

                if (node.update) this.generateStatement(node.update);
                this.emit("GOTO", "", "", startLabel);

                this.emit("LABEL", "", "", endLabel);
                this.breakLabelStack.pop();
                break;
            }

            case "Block":
                if (node.statements) {
                    for (const stmt of node.statements) {
                        this.generateStatement(stmt);
                    }
                }
                break;

            case "ReturnStatement": {
                const val = node.value ? this.generateExpression(node.value) : "";
                this.emit("RETURN", val, "", "");
                break;
            }

            case "FunctionCall":
                this.generateFunctionCall(node);
                break;

            case "ArrayDeclaration": {
                const arrName = node.identifier || node.name;
                if (node.elements) {
                    this.emit("ARR_DECL", String(node.elements.length), "", arrName);
                    node.elements.forEach((el, idx) => {
                        const val = this.generateExpression(el);
                        this.emit("ARR_INIT_ELEM", String(idx), val, arrName);
                    });
                } else {
                    const sizeVal = node.size ? this.generateExpression(node.size) : "0";
                    this.emit("ARR_DECL", sizeVal, "", arrName);
                }
                break;
            }

            case "ArrayAssignment": {
                const arrName = node.name || node.identifier;
                const idx = this.generateExpression(node.index);
                if (this.isScannerRead(node.value)) {
                    const temp = this.newTemp();
                    this.emit("CALL", "input", 0, temp);
                    this.emit("ARR_SET", arrName, idx, temp);
                } else {
                    const val = this.generateExpression(node.value);
                    this.emit("ARR_SET", arrName, idx, val);
                }
                break;
            }

            case "UpdateExpression": {
                const varName = node.identifier || node.name;
                this.emit(node.operator === "++" ? "+" : "-", varName, "1", varName);
                break;
            }
        }
    }

    generateExpression(node) {
        if (!node) return "";

        switch (node.type) {
            case "Literal":
                if (node.rawType === "STRING" || typeof node.value === "string") {
                    return JSON.stringify(String(node.value));
                }
                return String(node.value);

            case "Identifier":
                return node.name || node.identifier;

            case "ScannerRead": {
                const temp = this.newTemp();
                this.emit("CALL", "input", 0, temp);
                return temp;
            }

            case "BinaryExpression": {
                const left = this.generateExpression(node.left);
                const right = this.generateExpression(node.right);
                const temp = this.newTemp();
                this.emit(node.operator, left, right, temp);
                return temp;
            }

            case "FunctionCall": {
                if (this.isScannerRead(node)) {
                    const temp = this.newTemp();
                    this.emit("CALL", "input", 0, temp);
                    return temp;
                }
                return this.generateFunctionCall(node);
            }

            case "ArrayAccess": {
                const arrName = node.name || node.identifier;
                const idx = this.generateExpression(node.index);
                const temp = this.newTemp();
                this.emit("ARR_GET", arrName, idx, temp);
                return temp;
            }

            default:
                return "";
        }
    }

    generateFunctionCall(node) {
        const argTemps = [];
        if (node.arguments) {
            for (const arg of node.arguments) {
                const temp = this.generateExpression(arg);
                argTemps.push(temp);
            }
        }

        for (const argTemp of argTemps) {
            this.emit("PARAM", argTemp, "", "");
        }

        const temp = this.newTemp();
        this.emit("CALL", node.name, argTemps.length, temp);
        return temp;
    }

    toStringArray() {
        return this.instructions.map(inst => {
            if (inst.op === "LABEL") return `${inst.result}:`;
            if (inst.op === "=") return `${inst.result} = ${inst.arg1}`;
            if (["+", "-", "*", "/", "%", "==", "!=", "<", ">", "<=", ">=", "&&", "||"].includes(inst.op)) {
                return `${inst.result} = ${inst.arg1} ${inst.op} ${inst.arg2}`;
            }
            if (inst.op === "IFFALSE") return `IF_FALSE ${inst.arg1} GOTO ${inst.result}`;
            if (inst.op === "GOTO") return `GOTO ${inst.result}`;
            if (inst.op === "PARAM") return `PARAM ${inst.arg1}`;
            if (inst.op === "CALL") return `${inst.result} = CALL ${inst.arg1}, ${inst.arg2}`;
            if (inst.op === "RETURN") return `RETURN ${inst.arg1}`;
            if (inst.op === "END_FUNC") return `END_FUNC ${inst.result}`;
            if (inst.op === "ARR_DECL") return `${inst.result} = ARRAY[${inst.arg1}]`;
            if (inst.op === "ARR_INIT_ELEM") return `${inst.result}[${inst.arg1}] = ${inst.arg2}`;
            if (inst.op === "ARR_SET") return `${inst.arg1}[${inst.arg2}] = ${inst.result}`;
            if (inst.op === "ARR_GET") return `${inst.result} = ${inst.arg1}[${inst.arg2}]`;
            return `${inst.op} ${inst.arg1} ${inst.arg2} ${inst.result}`.trim();
        });
    }
}

module.exports = TACGenerator;