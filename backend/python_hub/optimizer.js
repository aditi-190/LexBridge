class TACOptimizer {
  optimize(instructions) {
    let optimized = [...instructions];
    optimized = optimized.map((inst) => {

      if (["+", "-", "*"].includes(inst.op)) {
        const num1 = Number(inst.arg1);
        const num2 = Number(inst.arg2);
        if (!isNaN(num1) && !isNaN(num2)) {
          let res = 0;
          if (inst.op === "+") res = num1 + num2;
          if (inst.op === "-") res = num1 - num2;
          if (inst.op === "*") res = num1 * num2;
          return { op: "=", arg1: String(res), arg2: null, result: inst.result };
        }
      }
      return inst;
    });
    return optimized;
  }
}
module.exports = TACOptimizer;