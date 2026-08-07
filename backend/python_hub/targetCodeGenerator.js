class TargetCodeGenerator {
  generate(tacInstructions) {
    const assembly = [];
    for (const inst of tacInstructions) {
      switch (inst.op) {
        case "=":
          assembly.push(`MOV ${inst.result}, ${inst.arg1}`);
          break;
        case "+":
          assembly.push(`MOV R0, ${inst.arg1}`);
          assembly.push(`ADD R0, ${inst.arg2}`);
          assembly.push(`MOV ${inst.result}, R0`);
          break;
        case "-":
          assembly.push(`MOV R0, ${inst.arg1}`);
          assembly.push(`SUB R0, ${inst.arg2}`);
          assembly.push(`MOV ${inst.result}, R0`);
          break;
        case "*":
          assembly.push(`MOV R0, ${inst.arg1}`);
          assembly.push(`MUL R0, ${inst.arg2}`);
          assembly.push(`MOV ${inst.result}, R0`);
          break;
        case ">":
        case "<":
        case "==":
          assembly.push(`CMP ${inst.arg1}, ${inst.arg2}`);
          assembly.push(`SET${inst.op} ${inst.result}`);
          break;
        case "and":
          assembly.push(`AND ${inst.arg1}, ${inst.arg2} -> ${inst.result}`);
          break;
        case "or":
          assembly.push(`OR ${inst.arg1}, ${inst.arg2} -> ${inst.result}`);
          break;
        case "not":
          assembly.push(`NOT ${inst.arg1} -> ${inst.result}`);
          break;
        case "NEG":
          assembly.push(`NEG ${inst.arg1} -> ${inst.result}`);
          break;
        case "PARAM":
          assembly.push(`PUSH ${inst.arg1}`);
          break;
        case "CALL":
          assembly.push(`CALL ${inst.arg1}`);
          break;
        case "IFFALSE":
          assembly.push(`JZ ${inst.result}`);
          break;
        case "GOTO":
          assembly.push(`JMP ${inst.result}`);
          break;
        case "LABEL":
          assembly.push(`${inst.result}:`);
          break;
        default:
          break;
      }
    }
    return assembly.join("\n");
  }
}
module.exports = TargetCodeGenerator;