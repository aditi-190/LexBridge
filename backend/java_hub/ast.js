// backend/java_hub/ast.js

// Program Node
function ProgramNode(body = []) {
    return {
        type: "Program",
        body
    };
}

// Variable Declaration (e.g., int x = 10;)
function VariableDeclarationNode(dataType, identifier, value = null) {
    return {
        type: "VariableDeclaration",
        dataType,
        identifier,
        value
    };
}

// Assignment (e.g., x = 20;)
function AssignmentNode(identifier, value) {
    return {
        type: "Assignment",
        identifier,
        value
    };
}

// Literal (10, 3.14, "Hello", true)
function LiteralNode(value, rawType = null) {
    return {
        type: "Literal",
        value,
        rawType // Optional: "INT", "FLOAT", "STRING", "BOOLEAN"
    };
}

// Identifier (x, sum, add)
function IdentifierNode(name) {
    return {
        type: "Identifier",
        name
    };
}

// Binary Expression (e.g., a + b, x > 5)
function BinaryExpressionNode(operator, left, right) {
    return {
        type: "BinaryExpression",
        operator,
        left,
        right
    };
}

// Function Call (e.g., add(5, 10); or print(x);)
function FunctionCallNode(name, argumentsList = []) {
    return {
        type: "FunctionCall",
        name,
        arguments: argumentsList
    };
}

// Block Node (e.g., { stmt1; stmt2; })
function BlockNode(statements = []) {
    return {
        type: "Block",
        statements
    };
}

// If Statement (e.g., if (x > 5) { ... } else { ... })
function IfStatementNode(condition, thenBranch, elseBranch = null) {
    return {
        type: "IfStatement",
        condition,
        thenBranch,
        elseBranch
    };
}

// While Statement (e.g., while (x < 10) { ... })
function WhileStatementNode(condition, body) {
    return {
        type: "WhileStatement",
        condition,
        body
    };
}

// For Statement (e.g., for (int i = 0; i < 10; i = i + 1) { ... })
function ForStatementNode(init, condition, update, body) {
    return {
        type: "ForStatement",
        init,
        condition,
        update,
        body
    };
}

// Function Declaration (e.g., int add(int a, int b) { ... })
function FunctionDeclarationNode(returnType, name, params = [], body = null) {
    return {
        type: "FunctionDeclaration",
        returnType,
        name,
        params, // Array of { dataType, identifier }
        body
    };
}

// Return Statement (e.g., return x + y;)
function ReturnStatementNode(value = null) {
    return {
        type: "ReturnStatement",
        value
    };
}

module.exports = {
    ProgramNode,
    VariableDeclarationNode,
    AssignmentNode,
    LiteralNode,
    IdentifierNode,
    BinaryExpressionNode,
    FunctionCallNode,
    BlockNode,
    IfStatementNode,
    WhileStatementNode,
    ForStatementNode,
    FunctionDeclarationNode,
    ReturnStatementNode
};