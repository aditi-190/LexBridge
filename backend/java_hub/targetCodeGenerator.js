class TargetCodeGenerator {
    constructor() {
        this.asm = [];
        this.lastJumpCondition = "JE";
    }

    formatOperand(arg) {
        if (arg === null || arg === undefined) return "";
        let str = String(arg).trim();
        if (!isNaN(str) || str.startsWith("[")) {
            return str;
        }
        return `[${str}]`;
    }

    emit(instruction) {
        this.asm.push(instruction);
    }

    generate(tacInstructions) {
        this.asm = [];
        
        for (const inst of tacInstructions) {
            this.translateInstruction(inst);
        }

        this.emit("    MOV EAX, 1");
        this.emit("    XOR EBX, EBX");
        this.emit("    INT 0x80");

        return this.asm;
    }

    translateInstruction(inst) {
        const { op, arg1, arg2, result } = inst;

        if (op === "LABEL") {
            this.emit(`${result}:`);
            return;
        }

        if (op === "END_FUNC" || op === "PARAM_DECL") {
            return;
        }

        if (op === "=") {
            this.emit(`    MOV EAX, ${this.formatOperand(arg1)}`);
            this.emit(`    MOV [${result}], EAX`);
            return;
        }

        if (["+", "-", "*", "/"].includes(op)) {
            this.emit(`    MOV EAX, ${this.formatOperand(arg1)}`);
            if (op === "+") this.emit(`    ADD EAX, ${this.formatOperand(arg2)}`);
            if (op === "-") this.emit(`    SUB EAX, ${this.formatOperand(arg2)}`);
            if (op === "*") this.emit(`    IMUL EAX, ${this.formatOperand(arg2)}`);
            if (op === "/") {
                this.emit(`    CDQ`);
                this.emit(`    IDIV ${this.formatOperand(arg2)}`);
            }
            this.emit(`    MOV [${result}], EAX`);
            return;
        }

        if (["==", "!=", "<", ">", "<=", ">="].includes(op)) {
            this.emit(`    MOV EAX, ${this.formatOperand(arg1)}`);
            this.emit(`    CMP EAX, ${this.formatOperand(arg2)}`);
            
            if (op === ">")  this.lastJumpCondition = "JLE";
            if (op === "<")  this.lastJumpCondition = "JGE";
            if (op === ">=") this.lastJumpCondition = "JL";
            if (op === "<=") this.lastJumpCondition = "JG";
            if (op === "==") this.lastJumpCondition = "JNE";
            if (op === "!=") this.lastJumpCondition = "JE";

            return;
        }

        if (op === "IFFALSE") {
            this.emit(`    ${this.lastJumpCondition} ${result}`);
            return;
        }

        if (op === "GOTO") {
            this.emit(`    JMP ${result}`);
            return;
        }

        if (op === "PARAM") {
            this.emit(`    PUSH ${this.formatOperand(arg1)}`);
            return;
        }

        if (op === "CALL") {
            this.emit(`    CALL ${arg1}`);
            this.emit(`    ADD ESP, ${arg2 * 4}`);
            if (result) {
                this.emit(`    MOV [${result}], EAX`);
            }
            return;
        }

        if (op === "RETURN") {
            this.emit(`    MOV EAX, ${this.formatOperand(arg1)}`);
            this.emit(`    RET`);
            return;
        }
    }

    toString() {
        return this.asm.join("\n");
    }
}

module.exports = TargetCodeGenerator;