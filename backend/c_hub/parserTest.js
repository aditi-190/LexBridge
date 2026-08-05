const { tokenizeC } = require("./lexer");
const { parseC } = require("./parser");


// ==========================================
// TEST REAL C PROGRAM
// ==========================================

const code = `
#include <stdio.h>

int add(int a, int b) {

    return a + b;

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
// LEXER TEST
// ==========================================

const lexical = tokenizeC(code);

console.log("===== LEXER TEST =====");

console.log("\nLexer Errors:");

console.log(
    JSON.stringify(
        lexical.errors,
        null,
        2
    )
);


// ==========================================
// PARSER TEST
// ==========================================

const syntax = parseC(
    lexical.tokens
);

console.log("\n===== PARSER TEST =====");

console.log("\nParser Errors:");

console.log(
    JSON.stringify(
        syntax.errors,
        null,
        2
    )
);


// ==========================================
// AST
// ==========================================

console.log("\n===== AST =====");

console.log(
    JSON.stringify(
        syntax.ast,
        null,
        2
    )
);