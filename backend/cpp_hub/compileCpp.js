const { executeProgram } = require("./programExecutor");

const { tokenizeCPP } = require("./lexer");
const { parseCPP } = require("./parser");

const { buildSymbolTable } = require("./symbolTable");

const { analyzeSemantic } = require("./semanticAnalyzer");

const { generateTAC } = require("./tacGenerator");

function compileCpp(sourceCode,input=" ") {

    // Lexical Analysis
    const lexical = tokenizeCPP(sourceCode);

    console.log("===== TOKENS =====");
console.log(lexical.tokens);

    if (lexical.errors.length > 0) {

        return {

            success: false,

            phase: "Lexical Analysis",

            errors: lexical.errors

        };

    }

    // Syntax Analysis
    const syntax = parseCPP(lexical.tokens);

console.log("===== PARSER ERRORS =====");
console.log(syntax.errors);



    if (syntax.errors.length > 0) {

        return {

            success: false,

            phase: "Syntax Analysis",

            errors: syntax.errors,

            tokens: lexical.tokens

        };

    }

    const ast = syntax.ast;

    console.log("===== AST =====");
console.log(JSON.stringify(ast, null, 2));

    // Find main()
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

    // Symbol Table
    const symbolResult =
        buildSymbolTable(ast);

    console.log("===== SYMBOL TABLE =====");
console.log(symbolResult.symbolTable);

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

    // Semantic Analysis
    const semantic =
        analyzeSemantic(ast);

    console.log("===== SEMANTIC ANALYSIS =====");
console.log(semantic);    

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

    // TAC Generation
    const tacResult =
        generateTAC(ast);

    const tac =
        tacResult &&
        Array.isArray(tacResult.code)
            ? tacResult.code
            : [];

    console.log("\n===== GENERATED TAC =====");

    console.log(tac.join("\n"));

    // Execute Program
   const execution =
    executeProgram(ast, input);
    console.log(execution);

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
                execution.error,

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

    compileCpp,

    runCompiler: compileCpp

};