const { tokenizeC } = require("./lexer");
const { parseC } = require("./parser");
const { buildSymbolTable } = require("./symbolTable");

const code = `
int add(int a, int b) {

    int result;

    result = a + b;

    return result;
}

int main() {

    int x;

    x = add(10, 20);

    return 0;
}
`;

const lexical = tokenizeC(code);

const syntax = parseC(lexical.tokens);

const result = buildSymbolTable(syntax.ast);

console.log("Lexer Errors:");
console.log(lexical.errors);

console.log("\nParser Errors:");
console.log(syntax.errors);

console.log("\nSymbol Table:");
console.log(
    JSON.stringify(
        result.symbolTable,
        null,
        2
    )
);

console.log("\nSymbol Table Errors:");
console.log(
    JSON.stringify(
        result.errors,
        null,
        2
    )
);