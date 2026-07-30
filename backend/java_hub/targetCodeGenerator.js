class TargetCodeGenerator {
    constructor() {
        this.asm = [];
    }

    emit(instruction) {
        this.asm.push(instruction);
    }

    generate(tacInstructions) {
        this.asm = [];
        this.emit("; --- Generated Assembly Code (x86-style) ---");
        this.emit("section .text");
        this.emit("global _start");
        this.emit("");

        for (const inst of tacInstructions) {
            this.translateInstruction(inst);
        }

        return this.asm;
    }

    translateInstruction(inst) {
        const { op, arg1, arg2, result } = inst;

        if (op === "LABEL") {
            this.emit(`${result}:`);
            return;
        }

        if (op === "END_FUNC") {
            this.emit(`    ; End of function ${result}`);
            this.emit("");
            return;
        }

        if (op === "PARAM_DECL") {
            this.emit(`    ; Parameter declaration: ${result}`);
            return;
        }

        if (op === "=") {
            this.emit(`    MOV EAX, ${arg1}`);
            this.emit(`    MOV [${result}], EAX`);
            return;
        }

        if (["+", "-", "*", "/"].includes(op)) {
            this.emit(`    MOV EAX, ${arg1}`);
            if (op === "+") this.emit(`    ADD EAX, ${arg2}`);
            if (op === "-") this.emit(`    SUB EAX, ${arg2}`);
            if (op === "*") this.emit(`    IMUL EAX, ${arg2}`);
            if (op === "/") {
                this.emit(`    CDQ`);
                this.emit(`    IDIV ${arg2}`);
            }
            this.emit(`    MOV [${result}], EAX`);
            return;
        }
        if (["==", "!=", "<", ">", "<=", ">="].includes(op)) {
            this.emit(`    MOV EAX, ${arg1}`);
            this.emit(`    CMP EAX, ${arg2}`);
            
            let jumpCondition = "JNE";
            if (op === ">") jumpCondition = "JLE";
            if (op === "<") jumpCondition = "JGE";
            if (op === "==") jumpCondition = "JNE";

            this.emit(`    ; Evaluation for ${result}`);
            return;
        }

        if (op === "IFFALSE") {
            this.emit(`    ; Conditional Jump`);
            this.emit(`    CMP EAX, 0`);
            this.emit(`    JE ${result}`);
            return;
        }

        if (op === "GOTO") {
            this.emit(`    JMP ${result}`);
            return;
        }

        if (op === "PARAM") {
            this.emit(`    PUSH ${arg1}`);
            return;
        }

        if (op === "CALL") {
            this.emit(`    CALL ${arg1}`);
            this.emit(`    ADD ESP, ${arg2 * 4}`); // Clean up stack (4 bytes per param)
            if (result) {
                this.emit(`    MOV [${result}], EAX`);
            }
            return;
        }

        if (op === "RETURN") {
            this.emit(`    MOV EAX, ${arg1}`);
            this.emit(`    RET`);
            return;
        }
    }

    toString() {
        return this.asm.join("\n");
    }
}

module.exports = TargetCodeGenerator;