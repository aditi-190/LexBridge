const { tokenizeCPP } = require("./lexer");
const { parseCPP } = require("./parser");
const { buildSymbolTable } = require("./symbolTable");

const code = `
#include <iostream>
using namespace std;

int add(int a, int b)
{
    int result;
    result = a + b;
    return result;
}

int main()
{
    int x;
    x = add(10, 20);

    cout << "Result = " << x << endl;

    return 0;
}
`;

const lexical = tokenizeCPP(code);

const syntax = parseCPP(lexical.tokens);

const result = buildSymbolTable(syntax.ast);

console.log("========== SYMBOL TABLE TEST ==========\n");

console.log("Lexer Errors:");
console.log(
    JSON.stringify(
        lexical.errors,
        null,
        2
    )
);

console.log("\nParser Errors:");
console.log(
    JSON.stringify(
        syntax.errors,
        null,
        2
    )
);

console.log("\n===== SYMBOL TABLE =====");

console.log(
    JSON.stringify(
        result.symbolTable,
        null,
        2
    )
);

console.log("\n===== SYMBOL TABLE ERRORS =====");

console.log(
    JSON.stringify(
        result.errors,
        null,
        2
    )
);