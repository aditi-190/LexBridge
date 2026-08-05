class SemanticAnalyzer {
  constructor() {
    this.symbolTable = new Set();
    this.errors = [];
    this.symbolTable.add("print");
    this.symbolTable.add("input");
    this.symbolTable.add("int"); 
    this.symbolTable.add("str"); 
  }

  analyze(ast) {
    this.visit(ast);
    return { errors: this.errors };
  }

  visit(node) {
    if (!node) return;

    if (node.type === "Program") {
      node.body.forEach((child) => {
        if (child.type === "FunctionDeclaration") {
          this.symbolTable.add(child.name);
        }
      });
      node.body.forEach((child) => this.visit(child));
      return;
    }

    if (node.type === "FunctionDeclaration") {
      node.params.forEach((param) => this.symbolTable.add(param));
      node.body.forEach((child) => this.visit(child));
      return;
    }

    if (node.type === "CallExpression") {
      if (!this.symbolTable.has(node.name)) {
        this.errors.push(`SemanticError: Undeclared function '${node.name}' called.`);
      }
      if (node.args) {
        node.args.forEach((arg) => this.visit(arg));
      }
      return;
    }

    if (node.type === "AssignmentExpression") {
      this.visit(node.right);
      this.symbolTable.add(node.left);
      return;
    }

    if (node.type === "ExpressionStatement") {
      this.visit(node.expression);
      return;
    }

    if (node.type === "ReturnStatement") {
      this.visit(node.argument);
      return;
    }

    if (node.type === "BinaryExpression") {
      this.visit(node.left);
      this.visit(node.right);
      return;
    }

    if (node.type === "IfStatement") {
      this.visit(node.test);
      node.consequent.forEach((stmt) => this.visit(stmt));
      if (node.alternate) {
        node.alternate.forEach((stmt) => this.visit(stmt));
      }
      return;
    }

    if (node.type === "WhileStatement") {
      this.visit(node.test);
      node.body.forEach((stmt) => this.visit(stmt));
      return;
    }
  }
}

module.exports = SemanticAnalyzer;