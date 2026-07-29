const { tokenizeC } = require("./lexer");
const { parseC } = require("./parser");
const { analyzeSemantic } = require("./semanticAnalyzer");
const { executeC } = require("./executor");

function compileC(sourceCode) {

    const lexical = tokenizeC(sourceCode);

    if (lexical.errors.length > 0) {

        return {

            success: false,

            phase: "Lexical Analysis",

            errors: lexical.errors

        };

    }

    
    const syntax = parseC(lexical.tokens);

    if (syntax.errors.length > 0) {

        return {

            success: false,

            phase: "Syntax Analysis",

            errors: syntax.errors

        };

    }

    
    const semantic = analyzeSemantic(syntax.ast);

    if (semantic.errors.length > 0) {

        return {

            success: false,

            phase: "Semantic Analysis",

            errors: semantic.errors

        };

    }

   
    const execution = executeC(sourceCode);

    return {

        success: execution.success,

        ast: syntax.ast,

        symbolTable: semantic.symbolTable,

        output: execution.output,

        error: execution.error

    };

}

module.exports = {

    compileC

};