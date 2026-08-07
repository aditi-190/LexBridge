class SemanticAnalyzer {
  constructor() {
    this.symbolTable = new Set();
    this.errors = [];
    this.symbolTable.add("print");
    this.symbolTable.add("input");
    this.symbolTable.add("int");
    this.symbolTable.add("str");
  
    this.symbolTable.add("range");
 
    this.symbolTable.add("len");
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

    if (node.type === "ArrayLiteral") {
      node.elements.forEach((el) => this.visit(el));
      return;
    }

    if (node.type === "ArrayAccess") {
      if (!this.symbolTable.has(node.object)) {
        this.errors.push(`SemanticError: Undeclared variable '${node.object}' used.`);
      }
      this.visit(node.index);
      return;
    }

    if (node.type === "IndexAssignmentExpression") {
      if (!this.symbolTable.has(node.object)) {
        this.errors.push(`SemanticError: Undeclared variable '${node.object}' used.`);
      }
      this.visit(node.index);
      this.visit(node.right);
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


    if (node.type === "UnaryExpression") {
      this.visit(node.argument);
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

    if (node.type === "ForStatement") {
      this.symbolTable.add(node.varName);
      this.visit(node.iterable);
      node.body.forEach((stmt) => this.visit(stmt));
      return;
    }

    if (node.type === "DoWhileStatement") {
      node.body.forEach((stmt) => this.visit(stmt));
      this.visit(node.test);
      return;
    }
  }
}

module.exports = SemanticAnalyzer;