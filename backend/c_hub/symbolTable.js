class SymbolTable {

    constructor() {

        this.scopes = [];

        this.allScopes = [];

        // Create global scope
        this.enterScope();

    }


    // ==========================================
    // ENTER SCOPE
    // ==========================================

    enterScope() {


        const scope = {};

        this.scopes.push(scope);

        this.allScopes.push(scope);

    }


    // ==========================================
    // EXIT SCOPE
    // ==========================================

    exitScope() {

        // Keep global scope alive
        if (this.scopes.length > 1) {

            this.scopes.pop();

        }

    }


    // ==========================================
    // CURRENT SCOPE
    // ==========================================

    currentScope() {

        return this.scopes[
            this.scopes.length - 1
        ];

    }


    // ==========================================
    // DECLARE SYMBOL
    // ==========================================

    declare(
        name,
        type,
        line,
        kind = "variable"
    ) 
    {
        console.log(
        "DECLARE =>",
        name,
        type,
        kind
    );
        

        const scope =
            this.currentScope();


        // Redeclaration check
        if (scope[name]) {

            const symbolType =
                kind === "function"
                    ? "Function"
                    : kind === "parameter"
                        ? "Parameter"
                        : "Variable";


            return {

                success: false,

                error:
                    `${symbolType} '${name}' already declared`

            };

        }


        scope[name] = {

            name,

            type,

            kind,

            scope: this.allScopes.indexOf(scope),

            lineDeclared: line

        };


        return {

            success: true,

            error: null

        };

    }

    lookup(name) {

        for (
            let i =
                this.scopes.length - 1;

            i >= 0;

            i--
        ) {

            if (this.scopes[i][name]) {

                return this.scopes[i][name];

            }

        }

        return null;

    }


   
    existsInCurrentScope(name) {

        return Boolean(
            this.currentScope()[name]
        );

    }


    getAllSymbols() {

        const result = {};


        this.allScopes.forEach(
            (scope, index) => {

                result[`scope_${index}`] =
                    scope;

            }
        );


        return result;

    }

}



function buildSymbolTable(ast) {

    const table =
        new SymbolTable();

    const errors = [];

    function addError(
        message,
        line = 0
    ) {

        errors.push({

            message,

            line

        });

    }

    function visit(node) {

        if (!node) {

            return;

        }


        switch (node.type) {


            

            case "Program":

                node.body.forEach(
                    visit
                );

                break;




            case "FunctionDeclaration": {

                // Register function globally

                const result =
                    table.declare(
                        node.name,
                        node.returnType || "int",
                        node.line || 0,
                        "function"
                    );


                if (!result.success) {

                    addError(
                        result.error,
                        node.line || 0
                    );

                    break;

                }


                // Function scope

                table.enterScope();


                // Parameters

                if (
                    Array.isArray(
                        node.params
                    )
                ) {

                    node.params.forEach(
                        param => {

                            const parameterResult =
                                table.declare(
                                    param.name,
                                    param.dataType,
                                    param.line || 0,
                                    "parameter"
                                );


                            if (
                                !parameterResult.success
                            ) {

                                addError(
                                    parameterResult.error,
                                    param.line || 0
                                );

                            }

                        }
                    );

                }


                // Function body

                if (
                    node.body &&
                    Array.isArray(
                        node.body.body
                    )
                ) {

                    node.body.body.forEach(
                        visit
                    );

                }


                table.exitScope();

                break;

            }


            // ==================================
            // MAIN FUNCTION
            // ==================================

            case "MainFunction": {

                // Register main globally

                const mainResult =
                    table.declare(
                        node.name,
                        node.returnType || "int",
                        node.line || 0,
                        "function"
                    );


                if (!mainResult.success) {

                    addError(
                        mainResult.error,
                        node.line || 0
                    );

                    break;

                }


                // Main scope

                table.enterScope();


                // Main parameters
                if (
                    Array.isArray(
                        node.params
                    )
                ) {

                    node.params.forEach(
                        param => {

                            const parameterResult =
                                table.declare(
                                    param.name,
                                    param.dataType,
                                    param.line || 0,
                                    "parameter"
                                );


                            if (
                                !parameterResult.success
                            ) {

                                addError(
                                    parameterResult.error,
                                    param.line || 0
                                );

                            }

                        }
                    );

                }


                // Main body

                if (
                    node.body &&
                    Array.isArray(
                        node.body.body
                    )
                ) {

                    node.body.body.forEach(
                        visit
                    );

                }


                table.exitScope();

                break;

            }


            // ==================================
            // BLOCK
            // ==================================

            case "Block": {

                table.enterScope();


                node.body.forEach(
                    visit
                );


                table.exitScope();

                break;

            }


            // ==================================
            // VARIABLE DECLARATION
            // ==================================


case "VariableDeclaration": {


    if(Array.isArray(node.variables)){


        node.variables.forEach(variable=>{


            const result =
                table.declare(
                    variable.name,
                    node.dataType || "int",
                    node.line || 0,
                    "variable"
                );


            if(!result.success){

                addError(
                    result.error,
                    node.line || 0
                );

            }


            if(variable.value){

                visit(variable.value);

            }


        });


    }


    break;

}
            // ==================================
            // ASSIGNMENT
            // ==================================

            case "Assignment":

                if (node.value) {

                    visit(node.value);

                }

                break;


            // ==================================
            // IF STATEMENT
            // ==================================

            case "IfStatement":

                visit(node.condition);

                visit(node.thenBranch);

                if (node.elseBranch) {

                    visit(node.elseBranch);

                }

                break;


            // ==================================
            // WHILE STATEMENT
            // ==================================

            case "WhileStatement":

                visit(node.condition);

                visit(node.body);

                break;


            // ==================================
            // PRINT
            // ==================================

            case "PrintStatement":

                visit(node.value);

                break;


            // ==================================
            // RETURN
            // ==================================

            case "ReturnStatement":

                visit(node.value);

                break;


            // ==================================
            // BINARY EXPRESSION
            // ==================================

            case "BinaryExpression":

                visit(node.left);

                visit(node.right);

                break;


            // ==================================
            // UNARY EXPRESSION
            // ==================================

            case "UnaryExpression":

                visit(node.operand);

                break;


            // ==================================
            // FUNCTION CALL
            // ==================================

            case "CallExpression":

                /*
                 * Function declaration checking
                 * will be handled by semantic analysis.
                 *
                 * Here we visit every argument.
                 */

                if (
                    Array.isArray(
                        node.arguments
                    )
                ) {

                    node.arguments.forEach(
                        visit
                    );

                }

                break;


            // ==================================
            // IDENTIFIER
            // ==================================

            case "Identifier":

                /*
                 * Lookup is handled by
                 * semantic analysis.
                 */

                break;


            // ==================================
            // LITERAL
            // ==================================

            case "Literal":

                break;

        }

    }


    // ======================================
    // START BUILD
    // ======================================

    visit(ast);


    // ======================================
    // RETURN RESULT
    // ======================================

    return {

        symbolTable:
            table.getAllSymbols(),

        errors

    };

}



// ==========================================
// EXPORT
// ==========================================

module.exports = {

    SymbolTable,

    buildSymbolTable

};