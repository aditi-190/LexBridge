function ProgramNode(body = []) {
    return {
        type: "Program",
        body
    };
}

function VariableDeclarationNode(dataType, identifier, value = null) {
    return {
        type: "VariableDeclaration",
        dataType,
        identifier,
        value
    };
}
function AssignmentNode(identifier, value) {
    return {
        type: "Assignment",
        identifier,
        value
    };
}
function LiteralNode(value, rawType = null) {
    return {
        type: "Literal",
        value,
        rawType 
    };
}

function IdentifierNode(name) {
    return {
        type: "Identifier",
        name
    };
}

function BinaryExpressionNode(operator, left, right) {
    return {
        type: "BinaryExpression",
        operator,
        left,
        right
    };
}
function FunctionCallNode(name, argumentsList = []) {
    return {
        type: "FunctionCall",
        name,
        arguments: argumentsList
    };
}

function BlockNode(statements = []) {
    return {
        type: "Block",
        statements
    };
}
function IfStatementNode(condition, thenBranch, elseBranch = null) {
    return {
        type: "IfStatement",
        condition,
        thenBranch,
        elseBranch
    };
}
function WhileStatementNode(condition, body) {
    return {
        type: "WhileStatement",
        condition,
        body
    };
}
function ForStatementNode(init, condition, update, body) {
    return {
        type: "ForStatement",
        init,
        condition,
        update,
        body
    };
}function FunctionDeclarationNode(returnType, name, params = [], body = null) {
    return {
        type: "FunctionDeclaration",
        returnType,
        name,
        params, 
        body
    };
}

function ReturnStatementNode(value = null) {
    return {
        type: "ReturnStatement",
        value
    };
}

function ArrayDeclarationNode(dataType, identifier, size = null, elements = null) {
    return {
        type: "ArrayDeclaration",
        dataType,
        identifier,
        size,    
        elements   
    };
}

function ArrayAccessNode(name, index) {
    return {
        type: "ArrayAccess",
        name,
        index
    };
}

function ArrayAssignmentNode(name, index, value) {
    return {
        type: "ArrayAssignment",
        name,
        index,
        value
    };
}

function SwitchStatementNode(discriminant, cases = [], defaultCase = null) {
    return {
        type: "SwitchStatement",
        discriminant,
        cases,       
        defaultCase   
    };
}

function CaseNode(test, body = []) {
    return {
        type: "Case",
        test,
        body
    };
}

function BreakStatementNode() {
    return {
        type: "BreakStatement"
    };
}

function UpdateExpressionNode(identifier, operator) {
    return {
        type: "UpdateExpression",
        identifier,
        operator
    };
}


function ScannerInitNode(identifier) {
    return {
        type: "ScannerInit",
        identifier
    };
}
function ScannerReadNode(identifier, method) {
    return {
        type: "ScannerRead",
        identifier,
        method
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
    ReturnStatementNode,
    ArrayDeclarationNode,
    ArrayAccessNode,
    ArrayAssignmentNode,
    SwitchStatementNode,
    CaseNode,
    BreakStatementNode,
    UpdateExpressionNode,
    ScannerInitNode,
    ScannerReadNode
};