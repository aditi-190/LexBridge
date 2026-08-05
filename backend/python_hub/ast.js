class ASTNode {
  constructor(type) {
    this.type = type;
  }
}

class ProgramNode extends ASTNode {
  constructor(body = []) {
    super("Program");
    this.body = body; 
  }
}

class AssignmentNode extends ASTNode {
  constructor(targets, value) {
    super("Assignment");
    this.targets = targets;
    this.value = value;    
  }
}

class BinaryOpNode extends ASTNode {
  constructor(left, operator, right) {
    super("BinaryOp");
    this.left = left;
    this.operator = operator; 
    this.right = right;
  }
}
class LiteralNode extends ASTNode {
  constructor(value, rawType) {
    super("Literal");
    this.value = value;
    this.rawType = rawType; 
  }
}

class IdentifierNode extends ASTNode {
  constructor(name) {
    super("Identifier");
    this.name = name;
  }
}
class CallNode extends ASTNode {
  constructor(callee, args = []) {
    super("CallExpression");
    this.callee = callee; 
    this.args = args;     
  }
}

class IfStatementNode extends ASTNode {
  constructor(test, consequent, alternate = null) {
    super("IfStatement");
    this.test = test;               
    this.consequent = consequent;     
    this.alternate = alternate;       
  }
}

class WhileStatementNode extends ASTNode {
  constructor(test, body) {
    super("WhileStatement");
    this.test = test; 
    this.body = body;
  }
}
class BlockNode extends ASTNode {
  constructor(body = []) {
    super("Block");
    this.body = body;
  }
}

module.exports = {
  ASTNode,
  ProgramNode,
  AssignmentNode,
  BinaryOpNode,
  LiteralNode,
  IdentifierNode,
  CallNode,
  IfStatementNode,
  WhileStatementNode,
  BlockNode
};