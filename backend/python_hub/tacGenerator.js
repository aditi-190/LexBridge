class TACGenerator {
  constructor() {
    this.instructions = [];
    this.tempCount = 0;
    this.labelCount = 0;
  }

  newTemp() {
    return `t${this.tempCount++}`;
  }

  newLabel() {
    return `L${this.labelCount++}`;
  }

  emit(instruction) {
    this.instructions.push(instruction);
  }

  generate(node) {
    if (!node) return;

    switch (node.type) {
      case "Program": {
        node.body.forEach((stmt) => this.generate(stmt));
        break;
      }

      case "FunctionDeclaration": {
        const skipLabel = this.newLabel();
        this.emit({ op: "GOTO", result: skipLabel });

        this.emit({ op: "LABEL", result: node.name });

        if (node.params) {
          node.params.forEach((param) => {
            this.emit({ op: "POPPARAM", result: param });
          });
        }

        if (node.body) {
          node.body.forEach((stmt) => this.generate(stmt));
        }

        this.emit({ op: "LABEL", result: skipLabel });
        break;
      }

      case "ExpressionStatement": {
        this.generate(node.expression);
        break;
      }
      case "CallExpression": {
        this.generateExpr(node);
        break;
      }

      case "AssignmentExpression": {
        const rightTemp = this.generateExpr(node.right);
        this.emit({ op: "=", arg1: rightTemp, result: node.left });
        break;
      }

      case "IfStatement": {
        const condTemp = this.generateExpr(node.test);
        const falseLabel = this.newLabel();

        this.emit({ op: "IFFALSE", arg1: condTemp, result: falseLabel });

        if (node.consequent) {
          node.consequent.forEach((stmt) => this.generate(stmt));
        }

        if (node.alternate) {
          const endLabel = this.newLabel();
          this.emit({ op: "GOTO", result: endLabel });
          this.emit({ op: "LABEL", result: falseLabel });
          node.alternate.forEach((stmt) => this.generate(stmt));
          this.emit({ op: "LABEL", result: endLabel });
        } else {
          this.emit({ op: "LABEL", result: falseLabel });
        }
        break;
      }

      case "WhileStatement": {
        const startLabel = this.newLabel();
        const endLabel = this.newLabel();

        this.emit({ op: "LABEL", result: startLabel });

        const condTemp = this.generateExpr(node.test);
        this.emit({ op: "IFFALSE", arg1: condTemp, result: endLabel });

        if (node.body) {
          node.body.forEach((stmt) => this.generate(stmt));
        }

        this.emit({ op: "GOTO", result: startLabel });
        this.emit({ op: "LABEL", result: endLabel });
        break;
      }

      // FIX/NEW: ForStatement had no TAC generation at all before.
      // Desugars `for varName in range(...)` into an equivalent
      // counter-based while loop. Supports range(stop),
      // range(start, stop) and range(start, stop, step) — assumes a
      // positive step (covers the standard "basic for loop" case).
      case "ForStatement": {
        const args = (node.iterable && node.iterable.args) || [];
        let startExpr, stopExpr, stepExpr;

        if (args.length <= 1) {
          startExpr = { type: "Literal", value: 0 };
          stopExpr = args[0] || { type: "Literal", value: 0 };
          stepExpr = { type: "Literal", value: 1 };
        } else if (args.length === 2) {
          startExpr = args[0];
          stopExpr = args[1];
          stepExpr = { type: "Literal", value: 1 };
        } else {
          startExpr = args[0];
          stopExpr = args[1];
          stepExpr = args[2];
        }

        const startVal = this.generateExpr(startExpr);
        this.emit({ op: "=", arg1: startVal, result: node.varName });

        const startLabel = this.newLabel();
        const endLabel = this.newLabel();
        this.emit({ op: "LABEL", result: startLabel });

        const stopVal = this.generateExpr(stopExpr);
        const condTemp = this.newTemp();
        this.emit({ op: "<", arg1: node.varName, arg2: stopVal, result: condTemp });
        this.emit({ op: "IFFALSE", arg1: condTemp, result: endLabel });

        if (node.body) {
          node.body.forEach((stmt) => this.generate(stmt));
        }

        const stepVal = this.generateExpr(stepExpr);
        const nextTemp = this.newTemp();
        this.emit({ op: "+", arg1: node.varName, arg2: stepVal, result: nextTemp });
        this.emit({ op: "=", arg1: nextTemp, result: node.varName });

        this.emit({ op: "GOTO", result: startLabel });
        this.emit({ op: "LABEL", result: endLabel });
        break;
      }

      // NEW: DoWhileStatement (custom extension) — body always runs at
      // least once, then loops back while the condition holds.
      case "DoWhileStatement": {
        const startLabel = this.newLabel();
        const endLabel = this.newLabel();

        this.emit({ op: "LABEL", result: startLabel });

        if (node.body) {
          node.body.forEach((stmt) => this.generate(stmt));
        }

        const condTemp = this.generateExpr(node.test);
        this.emit({ op: "IFFALSE", arg1: condTemp, result: endLabel });
        this.emit({ op: "GOTO", result: startLabel });
        this.emit({ op: "LABEL", result: endLabel });
        break;
      }

      case "ReturnStatement": {
        const retTemp = this.generateExpr(node.argument);
        this.emit({ op: "RETURN", arg1: retTemp });
        break;
      }

      default:
        break;
    }

    return this.instructions;
  }

  generateExpr(node) {
    if (!node) return null;

    if (typeof node === "number" || typeof node === "string") {
      return node;
    }

    if (node.type === "Literal") {
      // FIX: string literals were emitted into TAC as bare values
      // (e.g. `" "` became just the string " "), indistinguishable from
      // a plain variable-name lookup. getValue() would then try
      // Number(" ") — which JS evaluates to 0 — silently turning a
      // space literal into the number 0 (e.g. "Hello" + " " + "World"
      // became "Hello0World"). Wrapping string literals in real quote
      // characters here lets getValue() recognize and unwrap them
      // instead of guessing.
      return typeof node.value === "string" ? JSON.stringify(node.value) : node.value;
    }

    if (node.type === "Identifier") {
      return node.name;
    }

    if (node.type === "BinaryExpression") {
      const left = this.generateExpr(node.left);
      const right = this.generateExpr(node.right);
      const temp = this.newTemp();

      this.emit({ op: node.op, arg1: left, arg2: right, result: temp });
      return temp;
    }

    // FIX/NEW: UnaryExpression ("not x") had no TAC generation at all.
    if (node.type === "UnaryExpression") {
      const val = this.generateExpr(node.argument);
      const temp = this.newTemp();
      this.emit({ op: "not", arg1: val, result: temp });
      return temp;
    }

    if (node.type === "CallExpression") {
      if (node.args) {
        node.args.forEach((arg) => {
          const argTemp = this.generateExpr(arg);
          this.emit({ op: "PARAM", arg1: argTemp });
        });
      }
      const temp = this.newTemp();
      this.emit({ op: "CALL", arg1: node.name, result: temp });
      return temp;
    }

    return null;
  }
}

module.exports = TACGenerator;