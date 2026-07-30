const { tokenizeC } = require("./lexer");
const { parseC } = require("./parser");
const { analyzeSemantic } = require("./semanticAnalyzer");

const code = `
int main() {

    int x;

    x = 10;

    y = 20;

    return 0;
}
`;

const lexical = tokenizeC(code);

const syntax = parseC(lexical.tokens);

const semantic = analyzeSemantic(syntax.ast);

console.log("===== SEMANTIC TEST =====");

console.log("Errors:");

console.log(
    JSON.stringify(semantic.errors, null, 2)
);

console.log("\nSymbol Table:");

console.log(
    JSON.stringify(semantic.symbolTable, null, 2)
);