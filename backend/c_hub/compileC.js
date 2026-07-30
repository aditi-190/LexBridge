const { tokenizeC } = require("./lexer");
const { parseC } = require("./parser");
const { buildSymbolTable } = require("./symbolTable");
const { analyzeSemantic } = require("./semanticAnalyzer");
const { generateTAC } = require("./tacGenerator");

function compileC(sourceCode) {

    // =========================
    // 1. Lexical Analysis
    // =========================

    const lexical = tokenizeC(sourceCode);

    if (lexical.errors.length > 0) {

        return {

            success: false,

            phase: "Lexical Analysis",

            errors: lexical.errors

        };

    }


    // =========================
    // 2. Syntax Analysis
    // 3. AST Construction
    // =========================

    const syntax = parseC(lexical.tokens);

    if (syntax.errors.length > 0) {

        return {

            success: false,

            phase: "Syntax Analysis",

            errors: syntax.errors

        };

    }

    const ast = syntax.ast;


    // =========================
    // 4. Symbol Table
    // =========================

    const symbolResult = buildSymbolTable(ast);

    if (symbolResult.errors.length > 0) {

        return {

            success: false,

            phase: "Symbol Table",

            errors: symbolResult.errors,

            ast: ast,

            symbolTable: symbolResult.symbolTable

        };

    }


    // 5. Semantic Analysis
 

    const semantic = analyzeSemantic(ast);

    if (semantic.errors.length > 0) {

        return {

            success: false,

            phase: "Semantic Analysis",

            errors: semantic.errors,

            ast: ast,

            symbolTable: symbolResult.symbolTable

        };

    }

    // 6. Intermediate Code Generation
   

    const tac = generateTAC(ast);

    // Final Result
  

    return {

        success: true,

        phase: "Compilation Successful",

        tokens: lexical.tokens,

        ast: ast,

        symbolTable: symbolResult.symbolTable,

        semanticErrors: semantic.errors,

        tac: tac.code

    };

}

module.exports = {

    compileC

};