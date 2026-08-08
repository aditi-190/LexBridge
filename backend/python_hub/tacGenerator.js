class TACGenerator {
  constructor() {
    this.instructions = [];
    this.tempCount = 0;
    this.labelCount = 0;

    this.loopStack = [];
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

      // NEW: `arr[i] = value`.
      case "IndexAssignmentExpression": {
        const idxVal = this.generateExpr(node.index);
        const valTemp = this.generateExpr(node.right);
        this.emit({ op: "ARRAY_SET", arg1: idxVal, arg2: valTemp, result: node.object });
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

        // NEW: continue -> re-check condition (startLabel), break -> endLabel
        this.loopStack.push({ continueLabel: startLabel, breakLabel: endLabel });
        if (node.body) {
          node.body.forEach((stmt) => this.generate(stmt));
        }
        this.loopStack.pop();

        this.emit({ op: "GOTO", result: startLabel });
        this.emit({ op: "LABEL", result: endLabel });
        break;
      }

      case "BreakStatement": {
        if (this.loopStack.length > 0) {
          this.emit({ op: "GOTO", result: this.loopStack[this.loopStack.length - 1].breakLabel });
        }
        break;
      }

      case "ContinueStatement": {
        if (this.loopStack.length > 0) {
          this.emit({ op: "GOTO", result: this.loopStack[this.loopStack.length - 1].continueLabel });
        }
        break;
      }

     
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

  
        const continueLabel = this.newLabel();
        this.loopStack.push({ continueLabel, breakLabel: endLabel });
        if (node.body) {
          node.body.forEach((stmt) => this.generate(stmt));
        }
        this.loopStack.pop();

        this.emit({ op: "LABEL", result: continueLabel });
        const stepVal = this.generateExpr(stepExpr);
        const nextTemp = this.newTemp();
        this.emit({ op: "+", arg1: node.varName, arg2: stepVal, result: nextTemp });
        this.emit({ op: "=", arg1: nextTemp, result: node.varName });

        this.emit({ op: "GOTO", result: startLabel });
        this.emit({ op: "LABEL", result: endLabel });
        break;
      }

   
      case "DoWhileStatement": {
        const startLabel = this.newLabel();
        const continueLabel = this.newLabel();
        const endLabel = this.newLabel();

        this.emit({ op: "LABEL", result: startLabel });

      
        this.loopStack.push({ continueLabel, breakLabel: endLabel });
        if (node.body) {
          node.body.forEach((stmt) => this.generate(stmt));
        }
        this.loopStack.pop();

        this.emit({ op: "LABEL", result: continueLabel });
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

    if (node.type === "UnaryExpression") {
      const val = this.generateExpr(node.argument);
      const temp = this.newTemp();
      this.emit({ op: node.op === "-" ? "NEG" : "not", arg1: val, result: temp });
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

   
    if (node.type === "ArrayLiteral") {
      const arrTemp = this.newTemp();
      this.emit({ op: "ARRAY_NEW", result: arrTemp });
      node.elements.forEach((el) => {
        const elVal = this.generateExpr(el);
        this.emit({ op: "ARRAY_PUSH", arg1: elVal, result: arrTemp });
      });
      return arrTemp;
    }

    if (node.type === "ArrayAccess") {
      const idxVal = this.generateExpr(node.index);
      const temp = this.newTemp();
      this.emit({ op: "ARRAY_GET", arg1: node.object, arg2: idxVal, result: temp });
      return temp;
    }

    return null;
  }
}

module.exports = TACGenerator;