const Lexer = require("./lexer");
const Parser = require("./parser");
const SemanticAnalyzer = require("./semanticAnalyzer");
const TACGenerator = require("./tacGenerator");
const TACOptimizer = require("./optimizer");
const TargetCodeGenerator = require("./targetCodeGenerator");

function compileAndExecutePython(code, inputData = "") {
  try {
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();

    const parser = new Parser(tokens);
    const ast = parser.parse();

    const analyzer = new SemanticAnalyzer();
    const semanticResult = analyzer.analyze(ast);

    if (semanticResult.errors && semanticResult.errors.length > 0) {
      return {
        success: false,
        errors: semanticResult.errors
      };
    }

    const tacGen = new TACGenerator();
    const rawTac = tacGen.generate(ast);

    const optimizer = new TACOptimizer();
    const optimizedTac = optimizer.optimize(rawTac);

    const targetCodeGen = new TargetCodeGenerator();
    const assemblyCode = targetCodeGen.generate(optimizedTac);

    const output = executeTAC(optimizedTac, inputData);

    return {
      success: true,
      output: output,
      ast: ast,
      tac: optimizedTac,
      assembly: assemblyCode
    };

  } catch (error) {
    return {
      success: false,
      errors: [error.message]
    };
  }
}

function getValue(val, memory) {
  if (memory.hasOwnProperty(val)) {
    return memory[val];
  }
  // FIX: unwrap quoted string literals (see tacGenerator.js Literal
  // case) before falling back to numeric coercion — otherwise a literal
  // like " " gets silently read as the number 0 via Number(" ") === 0.
  if (typeof val === "string" && val.length >= 2 && val.startsWith('"') && val.endsWith('"')) {
    try {
      return JSON.parse(val);
    } catch (e) {
      return val.slice(1, -1);
    }
  }
  const parsed = Number(val);
  return !isNaN(parsed) ? parsed : val;
}

function executeTAC(instructions, rawInput) {
  const memory = {};
  const output = [];
  let params = [];
  const callStack = [];

  const inputQueue = rawInput
    .trim()
    .split(/\s+/)
    .filter((item) => item !== "");

  let pc = 0;
  let maxInstructions = 50000;
  let stepCount = 0;

  const labels = {};
  instructions.forEach((inst, idx) => {
    if (inst.op === "LABEL") {
      labels[inst.result] = idx;
    }
  });

  while (pc < instructions.length) {
    stepCount++;
    if (stepCount > maxInstructions) {
      throw new Error("Runtime Error: Execution limit exceeded (Possible Infinite Loop).");
    }

    const inst = instructions[pc];

    switch (inst.op) {
      case "=": {
        memory[inst.result] = getValue(inst.arg1, memory);
        break;
      }
      case "+": {
        const v1 = getValue(inst.arg1, memory);
        const v2 = getValue(inst.arg2, memory);
        memory[inst.result] = v1 + v2;
        break;
      }
      case "-": {
        const v1 = getValue(inst.arg1, memory);
        const v2 = getValue(inst.arg2, memory);
        memory[inst.result] = v1 - v2;
        break;
      }
      case "*": {
        const v1 = getValue(inst.arg1, memory);
        const v2 = getValue(inst.arg2, memory);
        memory[inst.result] = v1 * v2;
        break;
      }
      case "/": {
        const v1 = getValue(inst.arg1, memory);
        const v2 = getValue(inst.arg2, memory);
        memory[inst.result] = v1 / v2;
        break;
      }
      case "%": {
        const v1 = getValue(inst.arg1, memory);
        const v2 = getValue(inst.arg2, memory);
        memory[inst.result] = v1 % v2;
        break;
      }
      case ">": {
        const v1 = getValue(inst.arg1, memory);
        const v2 = getValue(inst.arg2, memory);
        memory[inst.result] = v1 > v2;
        break;
      }
      case "<": {
        const v1 = getValue(inst.arg1, memory);
        const v2 = getValue(inst.arg2, memory);
        memory[inst.result] = v1 < v2;
        break;
      }
      case "<=": {
        const v1 = getValue(inst.arg1, memory);
        const v2 = getValue(inst.arg2, memory);
        memory[inst.result] = v1 <= v2;
        break;
      }
      case ">=": {
        const v1 = getValue(inst.arg1, memory);
        const v2 = getValue(inst.arg2, memory);
        memory[inst.result] = v1 >= v2;
        break;
      }
      case "==": {
        const v1 = getValue(inst.arg1, memory);
        const v2 = getValue(inst.arg2, memory);
        memory[inst.result] = v1 === v2;
        break;
      }
      // FIX: "and" / "or" / "not" had no execution case at all, so any
      // program using them compiled fine but silently produced
      // `undefined` at runtime (fell through to `default: break`).
      case "and": {
        const v1 = getValue(inst.arg1, memory);
        const v2 = getValue(inst.arg2, memory);
        memory[inst.result] = !!(v1 && v2);
        break;
      }
      case "or": {
        const v1 = getValue(inst.arg1, memory);
        const v2 = getValue(inst.arg2, memory);
        memory[inst.result] = !!(v1 || v2);
        break;
      }
      case "not": {
        const v1 = getValue(inst.arg1, memory);
        memory[inst.result] = !v1;
        break;
      }
      case "PARAM": {
        const val = getValue(inst.arg1, memory);
        params.push(val);
        break;
      }
      case "POPPARAM": {
        if (params.length > 0) {
          memory[inst.result] = params.shift();
        }
        break;
      }
      case "CALL": {
        if (inst.arg1 === "print") {
          output.push(params.join(" "));
          params = [];
        } else if (inst.arg1 === "input") {
          let val = inputQueue.shift();
          if (val === undefined) val = "";
          memory[inst.result] = val;
          params = [];
        } else if (inst.arg1 === "int") {
          const argVal = params.length > 0 ? params.shift() : 0;
          const parsed = parseInt(argVal, 10);
          memory[inst.result] = isNaN(parsed) ? 0 : parsed;
        } else if (inst.arg1 === "str") {
          const argVal = params.length > 0 ? params.shift() : "";
          memory[inst.result] = String(argVal);
        } else if (labels.hasOwnProperty(inst.arg1)) {
          callStack.push({ returnAddress: pc + 1, targetTemp: inst.result });
          pc = labels[inst.arg1];
          continue; // Direct jump to function label
        }
        break;
      }
      case "RETURN": {
        const retVal = getValue(inst.arg1, memory);
        if (callStack.length > 0) {
          const frame = callStack.pop();
          if (frame.targetTemp) {
            memory[frame.targetTemp] = retVal;
          }
          pc = frame.returnAddress;
          continue; // Direct jump back after function call
        }
        break;
      }
      case "IFFALSE": {
        const cond = getValue(inst.arg1, memory);
        if (!cond) {
          if (labels.hasOwnProperty(inst.result)) {
            pc = labels[inst.result];
            continue;
          }
        }
        break;
      }
      case "GOTO": {
        if (labels.hasOwnProperty(inst.result)) {
          pc = labels[inst.result];
          continue;
        }
        break;
      }
      default:
        break;
    }

    pc++;
  }

  return output.length > 0 ? output.join("\n") : "Code executed successfully (No Output)";
}

module.exports = { compileAndExecutePython };