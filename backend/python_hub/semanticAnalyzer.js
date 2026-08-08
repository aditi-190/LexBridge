
class SemanticAnalyzer {
  constructor() {
    this.symbolTable = new Set();
    this.errors = [];

    this.symbolTable.add("print");
    this.symbolTable.add("input");
    this.symbolTable.add("int");
    this.symbolTable.add("str");
    this.symbolTable.add("float");
    this.symbolTable.add("range");
    this.symbolTable.add("len");
  }

  analyze(ast) {
    this.visit(ast);
    return { errors: this.errors };
  }

  visit(node) {
    if (!node) return;

    switch (node.type) {
      case "Program": {
      
        node.body.forEach((child) => {
          if (child.type === "FunctionDeclaration") {
            this.symbolTable.add(child.name);
          }
        });
        node.body.forEach((child) => this.visit(child));
        return;
      }

      case "FunctionDeclaration": {
        
        node.params.forEach((param) => this.symbolTable.add(param));
        node.body.forEach((stmt) => this.visit(stmt));
        return;
      }

      case "ExpressionStatement":
        this.visit(node.expression);
        return;

      case "AssignmentExpression":
        this.visit(node.right);
        this.symbolTable.add(node.left);
        return;

      case "IndexAssignmentExpression":
        if (!this.symbolTable.has(node.object)) {
          this.errors.push(`SemanticError: Undeclared variable '${node.object}' used.`);
        }
        this.visit(node.index);
        this.visit(node.right);
        return;

      case "ReturnStatement":
        this.visit(node.argument);
        return;

      case "CallExpression":
        if (!this.symbolTable.has(node.name)) {
          this.errors.push(`SemanticError: Undeclared function '${node.name}' called.`);
        }
        if (node.args) {
          node.args.forEach((arg) => this.visit(arg));
        }
        return;

      case "BinaryExpression":
        this.visit(node.left);
        this.visit(node.right);
        return;

      case "UnaryExpression":
        this.visit(node.argument);
        return;

      case "IfStatement":
        this.visit(node.test);
        node.consequent.forEach((stmt) => this.visit(stmt));
      
        if (node.alternate) {
          node.alternate.forEach((stmt) => this.visit(stmt));
        }
        return;

      case "WhileStatement":
        this.visit(node.test);
        node.body.forEach((stmt) => this.visit(stmt));
        return;

      case "ForStatement":
        this.symbolTable.add(node.varName);
        this.visit(node.iterable);
        node.body.forEach((stmt) => this.visit(stmt));
        return;

      case "DoWhileStatement":
        node.body.forEach((stmt) => this.visit(stmt));
        this.visit(node.test);
        return;

      case "ArrayLiteral":
        node.elements.forEach((el) => this.visit(el));
        return;

      case "ArrayAccess":
        if (!this.symbolTable.has(node.object)) {
          this.errors.push(`SemanticError: Undeclared variable '${node.object}' used.`);
        }
        this.visit(node.index);
        return;

     
      default:
        return;
    }
  }
}

module.exports = SemanticAnalyzer;