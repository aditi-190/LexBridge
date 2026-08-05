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
      return node.value;
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