console.log("VERSION CHECK: compileJava.js loaded at", new Date().toISOString());
const Parser = require("./parser");
const SemanticAnalyzer = require("./semanticAnalyzer");
const TACGenerator = require("./tacGenerator");

function executeTAC(instructions, rawInput = "") {
    const arrays = {};
    const output = [];
    const labels = {};
    
    const inputTokens = rawInput.trim().split(/\s+/).filter(Boolean);
    let inputIndex = 0;

    function readInput() {
        if (inputIndex < inputTokens.length) {
            return inputTokens[inputIndex++];
        }
        return "0";
    }
    const functionInfo = {};
    for (let i = 0; i < instructions.length; i++) {
        const inst = instructions[i];
        if (inst.op === "LABEL") {
            labels[inst.result] = i;
            if (instructions[i + 1] && instructions[i + 1].op === "PARAM_DECL") {
                const params = [];
                let pIndex = i + 1;
                while (pIndex < instructions.length && instructions[pIndex].op === "PARAM_DECL") {
                    params.push(instructions[pIndex].result);
                    pIndex++;
                }
                functionInfo[inst.result] = { labelPc: i, params };
            }
        }
    }

    let pc = 0;
    let stepCount = 0;
    const MAX_STEPS = 100000;
    let paramStack = [];
    const callStack = [];
    let currentEnv = {};

    const getVal = (val, env) => {
        if (val === "" || val === undefined) return undefined;
        if (typeof val === "string" && val.startsWith('"') && val.endsWith('"')) {
            return val.slice(1, -1);
        }
        if (typeof val === "number") return val;
        if (typeof val === "string" && val.trim() !== "" && !isNaN(Number(val))) {
            return Number(val);
        }
        if (val === "true") return true;
        if (val === "false") return false;
        return env[val] !== undefined ? env[val] : 0;
    };

    while (pc < instructions.length) {
        if (stepCount++ > MAX_STEPS) {
            output.push("Error: Maximum execution steps exceeded!");
            break;
        }

        const inst = instructions[pc];
        const { op, arg1, arg2, result } = inst;

        switch (op) {
            case "=":
                currentEnv[result] = getVal(arg1, currentEnv);
                pc++;
                break;

            case "+": {
                const left = getVal(arg1, currentEnv);
                const right = getVal(arg2, currentEnv);
                if (typeof left === "string" || typeof right === "string") {
                    currentEnv[result] = String(left) + String(right);
                } else {
                    currentEnv[result] = left + right;
                }
                pc++;
                break;
            }

            case "-":
                currentEnv[result] = getVal(arg1, currentEnv) - getVal(arg2, currentEnv);
                pc++;
                break;

            case "*":
                currentEnv[result] = getVal(arg1, currentEnv) * getVal(arg2, currentEnv);
                pc++;
                break;

            case "/":
                currentEnv[result] = getVal(arg1, currentEnv) / getVal(arg2, currentEnv);
                pc++;
                break;

            case "%":
                currentEnv[result] = getVal(arg1, currentEnv) % getVal(arg2, currentEnv);
                pc++;
                break;

            case "==":
                currentEnv[result] = getVal(arg1, currentEnv) === getVal(arg2, currentEnv);
                pc++;
                break;

            case "!=":
                currentEnv[result] = getVal(arg1, currentEnv) !== getVal(arg2, currentEnv);
                pc++;
                break;

            case "<":
                currentEnv[result] = getVal(arg1, currentEnv) < getVal(arg2, currentEnv);
                pc++;
                break;

            case ">":
                currentEnv[result] = getVal(arg1, currentEnv) > getVal(arg2, currentEnv);
                pc++;
                break;

            case "<=":
                currentEnv[result] = getVal(arg1, currentEnv) <= getVal(arg2, currentEnv);
                pc++;
                break;

            case ">=":
                currentEnv[result] = getVal(arg1, currentEnv) >= getVal(arg2, currentEnv);
                pc++;
                break;

            case "&&":
                currentEnv[result] = getVal(arg1, currentEnv) && getVal(arg2, currentEnv);
                pc++;
                break;

            case "||":
                currentEnv[result] = getVal(arg1, currentEnv) || getVal(arg2, currentEnv);
                pc++;
                break;

            case "ARR_DECL": {
                const size = getVal(arg1, currentEnv);
                arrays[result] = new Array(Number(size)).fill(0);
                pc++;
                break;
            }

            case "ARR_SET": {
                const arrName = arg1;
                const idx = getVal(arg2, currentEnv);
                const val = getVal(result, currentEnv);
                if (arrays[arrName]) {
                    arrays[arrName][idx] = val;
                }
                pc++;
                break;
            }

            case "ARR_GET": {
                const arrName = arg1;
                const idx = getVal(arg2, currentEnv);
                if (arrays[arrName]) {
                    currentEnv[result] = arrays[arrName][idx];
                } else {
                    currentEnv[result] = 0;
                }
                pc++;
                break;
            }

            case "IFFALSE":
                if (!getVal(arg1, currentEnv)) {
                    pc = labels[result] !== undefined ? labels[result] : pc + 1;
                } else {
                    pc++;
                }
                break;

            case "GOTO":
                pc = labels[result] !== undefined ? labels[result] : pc + 1;
                break;

            case "PARAM":
                paramStack.push(getVal(arg1, currentEnv));
                pc++;
                break;

            case "CALL":
                if (
                    arg1 === "print" || 
                    arg1 === "System.out.print" || 
                    arg1 === "System.out.println" ||
                    arg1.includes("print")
                ) {
                    const printArgs = [];
                    while (paramStack.length > 0) {
                        printArgs.unshift(paramStack.pop());
                    }
                    
                    const text = printArgs.join("");
                    output.push(text);
                    if (arg1.includes("println")) {
                        output.push("\n");
                    }
                    paramStack = [];
                    pc++;
                } else if (arg1 === "input") {
                    const rawVal = readInput();
                    const numVal = Number(rawVal);
                    currentEnv[result] = isNaN(numVal) ? rawVal : numVal;
                    paramStack = [];
                    pc++;
                } else if (arg1 === "sc.close" || arg1 === "close") {
                    paramStack = [];
                    pc++;
                } else if (labels[arg1] !== undefined) {
                    const nextEnv = {};
                    const fnInfo = functionInfo[arg1];
                    
                    if (fnInfo && fnInfo.params) {
                        const passedArgs = [];
                        const argCount = Number(arg2) || fnInfo.params.length;
                        for (let i = 0; i < argCount; i++) {
                            if (paramStack.length > 0) {
                                passedArgs.unshift(paramStack.pop());
                            }
                        }
                        fnInfo.params.forEach((paramName, idx) => {
                            nextEnv[paramName] = passedArgs[idx] !== undefined ? passedArgs[idx] : 0;
                        });
                    }

                    callStack.push({
                        returnPc: pc + 1,
                        targetVar: result,
                        env: currentEnv
                    });

                    currentEnv = nextEnv;
                    paramStack = [];
                    pc = labels[arg1];
                } else {
                    paramStack = [];
                    pc++;
                }
                break;

            case "RETURN": {
                const retVal = getVal(arg1, currentEnv);
                if (callStack.length > 0) {
                    const topFrame = callStack.pop();
                    currentEnv = topFrame.env;
                    if (topFrame.targetVar) {
                        currentEnv[topFrame.targetVar] = retVal;
                    }
                    pc = topFrame.returnPc;
                } else {
                    pc = instructions.length; 
                }
                break;
            }

            case "LABEL":
            case "DECLARE":
            case "END_FUNC":
            case "PARAM_DECL":
                pc++;
                break;

            default:
                pc++;
                break;
        }
    }

    return {
        output: output.join(""),
        env: currentEnv
    };
}

function compileJava(code, input = "") {
    try {
        const parser = new Parser(code);
        const ast = parser.parseProgram();

        const analyzer = new SemanticAnalyzer();
        const semanticResult = analyzer.analyze(ast);

        if (!semanticResult.isValid) {
            return {
                success: false,
                error: semanticResult.errors.join("\n"),
                ast,
                tac: []
            };
        }

        const generator = new TACGenerator();
        const tac = generator.generate(ast);

        const execution = executeTAC(tac, input);

        return {
            success: true,
            output: execution.output,
            ast,
            tac: generator.toStringArray(),
            env: execution.env
        };
    } catch (err) {
        return {
            success: false,
            error: err.message,
            ast: null,
            tac: []
        };
    }
}

module.exports = compileJava;