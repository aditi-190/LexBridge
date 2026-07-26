const { tokenizeJava } = require("../java_hub/lexer");
const { parseJava } = require("../java_hub/parser");
const { analyzeJava } = require("../java_hub/semanticAnalyzer");

function compileJava(sourceCode) {

    // Lexical Analysis
    const lexical = tokenizeJava(sourceCode);

    if (lexical.errors.length > 0) {

        return {
            success: false,
            stage: "Lexical Analysis",
            tokens: lexical.tokens,
            errors: lexical.errors
        };

    }

    // Syntax Analysis
    const syntax = parseJava(lexical.tokens);

    if (syntax.errors.length > 0) {

        return {
            success: false,
            stage: "Syntax Analysis",
            tokens: lexical.tokens,
            ast: syntax.ast,
            errors: syntax.errors
        };

    }

    // Semantic Analysis
    const semantic = analyzeJava(syntax.ast);

    if (semantic.errors.length > 0) {

        return {
            success: false,
            stage: "Semantic Analysis",
            tokens: lexical.tokens,
            ast: syntax.ast,
            symbolTable: semantic.symbolTable,
            errors: semantic.errors
        };

    }

    // Success
    return {

        success: true,

        stage: "Compilation Successful",

        tokens: lexical.tokens,

        ast: syntax.ast,

        symbolTable: semantic.symbolTable,

        errors: []

    };

}

module.exports = {

    compileJava

};