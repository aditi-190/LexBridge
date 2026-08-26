const { tokenizeC } = require("./lexer");
const { parseC } = require("./parser");
const { buildSymbolTable } = require("./symbolTable");
const { analyzeSemantic } = require("./semanticAnalyzer");
const { generateTAC } = require("./tacGenerator");
const { executeProgram } = require("./programExecutor");
console.log("compileC.js loaded");


function compileC(sourceCode,input=[]) {
     

    // 1. Lexical Analysis
    

    const lexical = tokenizeC(sourceCode);
    console.log("\n===== TOKENS =====");

lexical.tokens.forEach(token => {
    console.log(token.type, token.value);
});

    if (lexical.errors.length > 0) {

        return {
            success: false,
            phase: "Lexical Analysis",
            errors: lexical.errors
        };

    }



    // 2. Syntax Analysis


    const syntax = parseC(lexical.tokens);
    console.log("\n===== AST =====");

console.log(JSON.stringify(syntax.ast, null, 2));

    if (syntax.errors.length > 0) {

        return {
            success: false,
            phase: "Syntax Analysis",
            errors: syntax.errors,
            tokens: lexical.tokens
        };

    }

    const ast = syntax.ast;



    // 3. Symbol Table


const symbolResult =
    buildSymbolTable(ast);

 console.log("\n===== SYMBOL TABLE =====");

console.log(symbolResult.symbolTable);

    if (
        symbolResult.errors &&
        symbolResult.errors.length > 0
    ) {

        return {
            success: false,
            phase: "Symbol Table",
            errors: symbolResult.errors,
            tokens: lexical.tokens,
            ast,
            symbolTable:
                symbolResult.symbolTable
        };

    }

    
    // 4. Semantic Analysis
    

    const semantic =
        analyzeSemantic(ast);

    console.log("\n===== SEMANTIC ANALYSIS =====");
console.log(JSON.stringify(semantic, null, 2));

    if (
        semantic.errors &&
        semantic.errors.length > 0
    ) {

        return {
            success: false,
            phase: "Semantic Analysis",
            errors: semantic.errors,
            tokens: lexical.tokens,
            ast,
            symbolTable:
                symbolResult.symbolTable
        };

    }



    
    // 5. TAC Generation


    const tacResult =
        generateTAC(ast);

    const tac =
        tacResult &&
        Array.isArray(tacResult.code)
            ? tacResult.code
            : [];


    console.log(
        "\n===== GENERATED TAC ====="
    );

    console.log(
        tac.join("\n")
    );



    // 6. Program Execution

const execution = executeProgram(ast, input);

console.log("\n===== EXECUTION RESULT =====");
console.log(JSON.stringify(execution, null, 2));

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
            output:
                execution.output || "",
            error:
                execution.error ||
                "Program execution failed."
        };

    }



    // 7. FINAL RESULT


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
            execution.output || "",

        result:
            execution.result,

        variables:
            execution.variables

    };

}



// EXPORT


module.exports = {

    compileC,

    runCompiler: compileC

};