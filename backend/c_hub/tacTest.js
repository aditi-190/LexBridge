const { tokenizeC } = require("./lexer");
const { parseC } = require("./parser");
const { generateTAC } = require("./tacGenerator");

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

const lexical = tokenizeC(code);

const syntax = parseC(
    lexical.tokens
);

console.log("===== TAC TEST =====");

console.log("\nLexer Errors:");
console.log(lexical.errors);

console.log("\nParser Errors:");
console.log(syntax.errors);

if (
    lexical.errors.length === 0 &&
    syntax.errors.length === 0
) {

    const tacResult =
        generateTAC(syntax.ast);

    console.log("\n===== TAC =====");

    console.log(
        tacResult.code.join("\n")
    );

}