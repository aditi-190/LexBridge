const { executeProgram } = require("./programExecutor");

const { tokenizeC } = require("./lexer");
const { parseC } = require("./parser");

const { buildSymbolTable } = require("./symbolTable");

const { analyzeSemantic } = require("./semanticAnalyzer");

const { generateTAC } = require("./tacGenerator");


function compileC(sourceCode) {

    const lexical = tokenizeC(sourceCode);


    if (lexical.errors.length > 0) {

        return {

            success: false,

            phase: "Lexical Analysis",

            errors: lexical.errors

        };

    }

    const syntax = parseC(
        lexical.tokens
    );


    if (syntax.errors.length > 0) {

        return {

            success: false,

            phase: "Syntax Analysis",

            errors: syntax.errors,

            tokens: lexical.tokens

        };

    }


    const ast = syntax.ast;

    const mainFunction =
        ast &&
        Array.isArray(ast.body)
            ? ast.body.find(
                node =>
                    node &&
                    node.type === "MainFunction"
            )
            : null;


    if (!mainFunction) {

        return {

            success: false,

            phase: "Syntax Analysis",

            errors: [
                {
                    message: "main function not found",
                    line: 0,
                    column: 0
                }
            ],

            tokens: lexical.tokens,

            ast

        };

    }

    const symbolResult =
        buildSymbolTable(ast);


    if (
        symbolResult.errors &&
        symbolResult.errors.length > 0
    ) {

        return {

            success: false,

            phase: "Symbol Table",

            errors:
                symbolResult.errors,

            tokens: lexical.tokens,

            ast,

            symbolTable:
                symbolResult.symbolTable

        };

    }


    const semantic =
        analyzeSemantic(ast);


    if (
        semantic.errors &&
        semantic.errors.length > 0
    ) {

        return {

            success: false,

            phase: "Semantic Analysis",

            errors:
                semantic.errors,

            tokens: lexical.tokens,

            ast,

            symbolTable:
                symbolResult.symbolTable

        };

    }
    const tacResult =
        generateTAC(ast);

    const tac =
        tacResult &&
        Array.isArray(tacResult.code)
            ? tacResult.code
            : [];


    // Debug TAC

    console.log(
        "\n===== GENERATED TAC ====="
    );

    console.log(
        tac.join("\n")
    );

    const execution =
        executeProgram(ast);
    if (!execution) {

        return {

            success: false,

            phase: "Program Execution",

            tokens: lexical.tokens,

            ast,

            symbolTable:
                symbolResult.symbolTable,

            semanticErrors:
                semantic.errors,

            tac,

            error:
                "Program execution returned no result."

        };

    }


    if (!execution.success) {

        return {

            success: false,

            phase: "Program Execution",

            tokens: lexical.tokens,

            ast,

            symbolTable:
                symbolResult.symbolTable,

            semanticErrors:
                semantic.errors,

            tac,

            error:
                execution.error ||
                "Program execution failed.",

            output:
                execution.output || ""

        };

    }

    return {

        success: true,

        phase: "Compilation Successful",

        tokens:
            lexical.tokens,

        ast,

        symbolTable:
            symbolResult.symbolTable,

        semanticErrors:
            semantic.errors,

        tac,

        output:
            execution.output || ""

    };

}

module.exports = {

    compileC,

    // Compatible with controller/service
    runCompiler: compileC

};