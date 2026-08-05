class Optimizer {
    constructor(instructions) {
        this.instructions = instructions;
    }

    optimize() {
        let optimized = [...this.instructions];

        optimized = this.constantFolding(optimized);
        optimized = this.copyPropagationAndDeadCode(optimized);

        return optimized;
    }

    constantFolding(instructions) {
        return instructions.map(inst => {
            const { op, arg1, arg2, result } = inst;

            if (["+", "-", "*", "/", ">", "<", "==", "!="].includes(op)) {
                const num1 = Number(arg1);
                const num2 = Number(arg2);

                if (arg1 !== "" && arg2 !== "" && !isNaN(num1) && !isNaN(num2)) {
                    let resVal;
                    switch (op) {
                        case "+": resVal = num1 + num2; break;
                        case "-": resVal = num1 - num2; break;
                        case "*": resVal = num1 * num2; break;
                        case "/": resVal = num1 / num2; break;
                        case ">": resVal = num1 > num2 ? 1 : 0; break;
                        case "<": resVal = num1 < num2 ? 1 : 0; break;
                        case "==": resVal = num1 == num2 ? 1 : 0; break;
                        case "!=": resVal = num1 != num2 ? 1 : 0; break;
                    }
                    return { op: "=", arg1: String(resVal), arg2: "", result };
                }
            }
            return inst;
        });
    }
    countUsages(instructions) {
        const usage = {};
        for (const inst of instructions) {
            for (const operand of [inst.arg1, inst.arg2]) {
                if (typeof operand === "string" && operand !== "") {
                    usage[operand] = (usage[operand] || 0) + 1;
                }
            }
        }
        return usage;
    }

    copyPropagationAndDeadCode(instructions) {
        const usage = this.countUsages(instructions);
        const newInsts = [];

        for (let i = 0; i < instructions.length; i++) {
            const current = instructions[i];
            const next = instructions[i + 1];

            const isTemp = current.result && current.result.startsWith("t");
        
            const usedExactlyOnce = isTemp && usage[current.result] === 1;

            if (
                next &&
                next.op === "=" &&
                next.arg1 === current.result &&
                usedExactlyOnce
            ) {
                newInsts.push({ ...current, result: next.result });
                i++; 
            } else {
                newInsts.push(current);
            }
        }

        return newInsts;
    }
}

module.exports = Optimizer;