// backend/java_hub/optimizer.js

class Optimizer {
    constructor(instructions) {
        this.instructions = instructions;
    }

    optimize() {
        let optimized = [...this.instructions];
        
        // Step 1: Constant Folding
        optimized = this.constantFolding(optimized);
        
        // Step 2: Redundant Assignment & Dead Code Optimization
        optimized = this.copyPropagationAndDeadCode(optimized);

        return optimized;
    }

    constantFolding(instructions) {
        return instructions.map(inst => {
            const { op, arg1, arg2, result } = inst;

            // Check if both arguments are numeric constants
            if (["+", "-", "*", "/", ">", "<", "==", "!="].includes(op)) {
                const num1 = Number(arg1);
                const num2 = Number(arg2);

                if (!isNaN(num1) && !isNaN(num2)) {
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

    copyPropagationAndDeadCode(instructions) {
        // Redundant temporary variable bypass (e.g., t2 = CALL add, 2 followed by x = t2)
        const newInsts = [];
        
        for (let i = 0; i < instructions.length; i++) {
            const current = instructions[i];
            const next = instructions[i + 1];

            // Pattern: result = temp, and next instruction assigns temp to a target variable
            if (
                next && 
                next.op === "=" && 
                next.arg1 === current.result && 
                current.result.startsWith("t")
            ) {
                newInsts.push({
                    ...current,
                    result: next.result
                });
                i++; // Skip the next simple assignment instruction
            } else {
                newInsts.push(current);
            }
        }

        return newInsts;
    }
}

module.exports = Optimizer;