const { tokenizeC } = require("./lexer");
const { parseC } = require("./parser");
const { buildSymbolTable } = require("./symbolTable");

const code = `
int main() {

    int x;

    x = 10;

    return 0;
}
`;

const lexical = tokenizeC(code);

const syntax = parseC(lexical.tokens);

const result = buildSymbolTable(syntax.ast);

console.log("Symbol Table:");
console.log(
    JSON.stringify(result.symbolTable, null, 2)
);

console.log("Symbol Table Errors:");
console.log(result.errors);