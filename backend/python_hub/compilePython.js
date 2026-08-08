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
class PyFloat extends Number {
  toString() {
    const n = this.valueOf();
    return Number.isInteger(n) ? n.toFixed(1) : String(n);
  }
}
function unwrapFloat(v) {
  return v instanceof PyFloat ? v.valueOf() : v;
}
class Frame {
  constructor(parent = null) {
    this.vars = Object.create(null);
    this.parent = parent;
  }
  has(name) {
    if (Object.prototype.hasOwnProperty.call(this.vars, name)) return true;
    return this.parent ? this.parent.has(name) : false;
  }
  get(name) {
    if (Object.prototype.hasOwnProperty.call(this.vars, name)) return this.vars[name];
    return this.parent ? this.parent.get(name) : undefined;
  }
  set(name, value) {
    this.vars[name] = value;
  }
}
function formatForOutput(v) {
  if (v instanceof PyFloat) return v.toString();
  if (typeof v === "boolean") return v ? "True" : "False";
  if (Array.isArray(v)) return "[" + v.map(formatForOutput).join(", ") + "]";
  return String(v);
}

function getValue(val, frame) {
  if (typeof val === "boolean") {
    return val;
  }
  if (frame.has(val)) {
    return frame.get(val);
  }
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
  const globalFrame = new Frame(null);
  let frame = globalFrame; 
  const output = [];
  let params = [];
  const callStack = [];

  const inputQueue = rawInput
    .trim()
    .split(/\s+/)
    .filter((item) => item !== "");

  let pc = 0;
  let maxInstructions = 2000000;
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
        frame.set(inst.result, getValue(inst.arg1, frame));
        break;
      }
      case "+": {
        const v1 = getValue(inst.arg1, frame);
        const v2 = getValue(inst.arg2, frame);
        if (typeof v1 === "string" || typeof v2 === "string") {
          frame.set(inst.result, formatForOutput(v1) + formatForOutput(v2));
        } else {
          const sum = Number(v1) + Number(v2);
          frame.set(inst.result, (v1 instanceof PyFloat || v2 instanceof PyFloat) ? new PyFloat(sum) : sum);
        }
        break;
      }
      case "-": {
        const v1 = getValue(inst.arg1, frame);
        const v2 = getValue(inst.arg2, frame);
        const diff = Number(v1) - Number(v2);
        frame.set(inst.result, (v1 instanceof PyFloat || v2 instanceof PyFloat) ? new PyFloat(diff) : diff);
        break;
      }
      case "*": {
        const v1 = getValue(inst.arg1, frame);
        const v2 = getValue(inst.arg2, frame);
        const prod = Number(v1) * Number(v2);
        frame.set(inst.result, (v1 instanceof PyFloat || v2 instanceof PyFloat) ? new PyFloat(prod) : prod);
        break;
      }
      case "/": {
        const v1 = getValue(inst.arg1, frame);
        const v2 = getValue(inst.arg2, frame);
        frame.set(inst.result, new PyFloat(Number(v1) / Number(v2)));
        break;
      }
      case "%": {
        const v1 = getValue(inst.arg1, frame);
        const v2 = getValue(inst.arg2, frame);
        const rem = Number(v1) % Number(v2);
        frame.set(inst.result, (v1 instanceof PyFloat || v2 instanceof PyFloat) ? new PyFloat(rem) : rem);
        break;
      }
      case ">": {
        const v1 = getValue(inst.arg1, frame);
        const v2 = getValue(inst.arg2, frame);
        frame.set(inst.result, unwrapFloat(v1) > unwrapFloat(v2));
        break;
      }
      case "<": {
        const v1 = getValue(inst.arg1, frame);
        const v2 = getValue(inst.arg2, frame);
        frame.set(inst.result, unwrapFloat(v1) < unwrapFloat(v2));
        break;
      }
      case "<=": {
        const v1 = getValue(inst.arg1, frame);
        const v2 = getValue(inst.arg2, frame);
        frame.set(inst.result, unwrapFloat(v1) <= unwrapFloat(v2));
        break;
      }
      case ">=": {
        const v1 = getValue(inst.arg1, frame);
        const v2 = getValue(inst.arg2, frame);
        frame.set(inst.result, unwrapFloat(v1) >= unwrapFloat(v2));
        break;
      }
      case "==": {
        const v1 = getValue(inst.arg1, frame);
        const v2 = getValue(inst.arg2, frame);
        frame.set(inst.result, unwrapFloat(v1) === unwrapFloat(v2));
        break;
      }
   
      case "and": {
        const v1 = getValue(inst.arg1, frame);
        const v2 = getValue(inst.arg2, frame);
        frame.set(inst.result, !!(v1 && v2));
        break;
      }
      case "or": {
        const v1 = getValue(inst.arg1, frame);
        const v2 = getValue(inst.arg2, frame);
        frame.set(inst.result, !!(v1 || v2));
        break;
      }
      case "not": {
        const v1 = getValue(inst.arg1, frame);
        frame.set(inst.result, !v1);
        break;
      }
      case "NEG": {
        const v1 = getValue(inst.arg1, frame);
        frame.set(inst.result, -v1);
        break;
      }
      case "ARRAY_NEW": {
        frame.set(inst.result, []);
        break;
      }
      case "ARRAY_PUSH": {
        const val = getValue(inst.arg1, frame);
        if (!Array.isArray(frame.get(inst.result))) frame.set(inst.result, []);
        frame.get(inst.result).push(val);
        break;
      }
      case "ARRAY_GET": {
        const arr = frame.get(inst.arg1);
        const idx = getValue(inst.arg2, frame);
        frame.set(inst.result, Array.isArray(arr) ? arr[idx] : undefined);
        break;
      }
      case "ARRAY_SET": {
        const idx = getValue(inst.arg1, frame);
        const val = getValue(inst.arg2, frame);
        if (!Array.isArray(frame.get(inst.result))) frame.set(inst.result, []);
        frame.get(inst.result)[idx] = val;
        break;
      }
      case "PARAM": {
        const val = getValue(inst.arg1, frame);
        params.push(val);
        break;
      }
      case "POPPARAM": {
        if (params.length > 0) {
          frame.set(inst.result, params.shift());
        }
        break;
      }
      case "CALL": {
        if (inst.arg1 === "print") {
          output.push(params.map(formatForOutput).join(" "));
          params = [];
        } else if (inst.arg1 === "input") {
          let val = inputQueue.shift();
          if (val === undefined) val = "";
          frame.set(inst.result, val);
          params = [];
        } else if (inst.arg1 === "int") {
          const argVal = params.length > 0 ? params.shift() : 0;
          const parsed = parseInt(argVal, 10);
          frame.set(inst.result, isNaN(parsed) ? 0 : parsed);
          params = [];
        } else if (inst.arg1 === "float") {
          // NEW: float(x) builtin — was missing entirely, calls to it
          // fell through with no case and silently returned undefined.
          const argVal = params.length > 0 ? params.shift() : 0;
          const parsed = parseFloat(argVal);
          frame.set(inst.result, new PyFloat(isNaN(parsed) ? 0 : parsed));
          params = [];
        } else if (inst.arg1 === "str") {
          const argVal = params.length > 0 ? params.shift() : "";
          frame.set(inst.result, formatForOutput(argVal));
          params = [];
        } else if (inst.arg1 === "len") {
          // NEW: len(arr) / len(str) builtin.
          const argVal = params.length > 0 ? params.shift() : undefined;
          frame.set(inst.result, (Array.isArray(argVal) || typeof argVal === "string")
            ? argVal.length
            : 0);
          params = [];
        } else if (labels.hasOwnProperty(inst.arg1)) {
  
          callStack.push({ returnAddress: pc + 1, targetTemp: inst.result, callerFrame: frame });
          frame = new Frame(globalFrame);
          pc = labels[inst.arg1];
          continue; 
        }
        break;
      }
      case "RETURN": {
        const retVal = getValue(inst.arg1, frame);
        if (callStack.length > 0) {
          const callInfo = callStack.pop();
          frame = callInfo.callerFrame; // restore caller's frame
          if (callInfo.targetTemp) {
            frame.set(callInfo.targetTemp, retVal);
          }
          pc = callInfo.returnAddress;
          continue; // Direct jump back after function call
        }
        break;
      }
      case "IFFALSE": {
        const cond = getValue(inst.arg1, frame);
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