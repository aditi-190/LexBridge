class TACGenerator {
    constructor() {
        this.instructions = [];
        this.tempCount = 1;
        this.labelCount = 1;
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

        if (ast && ast.type === "Program") {
            for (const stmt of ast.body) {
                this.generateStatement(stmt);
            }
        }
        return this.instructions;
    }

    generateStatement(node) {
        if (!node) return;

        switch (node.type) {
            case "VariableDeclaration":
                if (node.value) {
                    const val = this.generateExpression(node.value);
                    this.emit("=", val, "", node.identifier);
                } else {
                    this.emit("DECLARE", node.dataType, "", node.identifier);
                }
                break;

            case "Assignment": {
                const val = this.generateExpression(node.value);
                this.emit("=", val, "", node.identifier);
                break;
            }

            case "FunctionDeclaration": {
                this.emit("LABEL", "", "", node.name);
                for (const param of node.params) {
                    this.emit("PARAM_DECL", param.dataType, "", param.identifier);
                }
                if (node.body) {
                    for (const stmt of node.body.statements) {
                        this.generateStatement(stmt);
                    }
                }
                this.emit("END_FUNC", "", "", node.name);
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

                this.emit("LABEL", "", "", startLabel);
                const cond = this.generateExpression(node.condition);

                this.emit("IFFALSE", cond, "", endLabel);
                this.generateStatement(node.body);
                this.emit("GOTO", "", "", startLabel);

                this.emit("LABEL", "", "", endLabel);
                break;
            }

            case "ForStatement": {
                const startLabel = this.newLabel();
                const endLabel = this.newLabel();

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
                break;
            }

            case "Block":
                for (const stmt of node.statements) {
                    this.generateStatement(stmt);
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
        }
    }

    generateExpression(node) {
        if (!node) return "";

        switch (node.type) {
            case "Literal":
                return String(node.value);

            case "Identifier":
                return node.name;

            case "BinaryExpression": {
                const left = this.generateExpression(node.left);
                const right = this.generateExpression(node.right);
                const temp = this.newTemp();
                this.emit(node.operator, left, right, temp);
                return temp;
            }

            case "FunctionCall":
                return this.generateFunctionCall(node);

            default:
                return "";
        }
    }

    generateFunctionCall(node) {
        const argTemps = [];
        for (const arg of node.arguments) {
            const temp = this.generateExpression(arg);
            argTemps.push(temp);
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
            if (["+", "-", "*", "/", "==", "!=", "<", ">", "<=", ">="].includes(inst.op)) {
                return `${inst.result} = ${inst.arg1} ${inst.op} ${inst.arg2}`;
            }
            if (inst.op === "IFFALSE") return `IF_FALSE ${inst.arg1} GOTO ${inst.result}`;
            if (inst.op === "GOTO") return `GOTO ${inst.result}`;
            if (inst.op === "PARAM") return `PARAM ${inst.arg1}`;
            if (inst.op === "CALL") return `${inst.result} = CALL ${inst.arg1}, ${inst.arg2}`;
            if (inst.op === "RETURN") return `RETURN ${inst.arg1}`;
            if (inst.op === "END_FUNC") return `END_FUNC ${inst.result}`;
            return `${inst.op} ${inst.arg1} ${inst.arg2} ${inst.result}`.trim();
        });
    }
}

module.exports = TACGenerator;