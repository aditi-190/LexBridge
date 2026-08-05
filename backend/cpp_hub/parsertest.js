const { tokenizeCPP } = require("./lexer");
const { parseCPP } = require("./parser");

const code = `
#include <iostream>
using namespace std;

int main() {

    int num1 = 10;
    int num2 = 20;
    int sum;

    sum = num1 + num2;

    cout << "The sum is: " << sum << endl;

    return 0;
}
`;

const lexical = tokenizeCPP(code);

console.log("===== LEXER TEST =====");

console.log("\nLexer Errors:");

console.log(
    JSON.stringify(
        lexical.errors,
        null,
        2
    )
);

const syntax = parseCPP(
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

console.log("\n===== AST =====");

console.log(
    JSON.stringify(
        syntax.ast,
        null,
        2
    )
);