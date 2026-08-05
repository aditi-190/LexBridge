const { tokenizeC } = require("./lexer");
const { parseC } = require("./parser");
const { analyzeSemantic } = require("./semanticAnalyzer");


// ==========================================
// REAL C SEMANTIC TEST
// ==========================================

const code = `
#include <stdio.h>

int add(int a, int b) {

    int result;

    result = a + b;

    return result;
}

int main() {

    int i;
    int result;

    i = 1;

    while (i <= 3) {

        result = add(i, 10);

        printf("Result = %d\\n", result);

        i = i + 1;

    }

    return 0;
}
`;


// ==========================================
// LEXICAL ANALYSIS
// ==========================================

const lexical =
    tokenizeC(code);


// ==========================================
// SYNTAX ANALYSIS
// ==========================================

const syntax =
    parseC(
        lexical.tokens
    );


// ==========================================
// SEMANTIC ANALYSIS
// ==========================================

const semantic =
    analyzeSemantic(
        syntax.ast
    );


// ==========================================
// OUTPUT
// ==========================================

console.log(
    "\n===== REAL C SEMANTIC TEST ====="
);


console.log(
    "\nLexer Errors:"
);

console.log(
    JSON.stringify(
        lexical.errors,
        null,
        2
    )
);


console.log(
    "\nParser Errors:"
);

console.log(
    JSON.stringify(
        syntax.errors,
        null,
        2
    )
);


console.log(
    "\nSemantic Errors:"
);

console.log(
    JSON.stringify(
        semantic.errors,
        null,
        2
    )
);


console.log(
    "\nSymbol Table:"
);

console.log(
    JSON.stringify(
        semantic.symbolTable,
        null,
        2
    )
);