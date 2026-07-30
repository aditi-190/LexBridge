const { tokenizeC } = require("./lexer");
const { parseC } = require("./parser");

const code = `
int main() {

    int x;

    x = 10;

    if (x > 5 && x != 7) {

        print x;

    } else {

        print 0;

    }

    return 0;
}
`;

console.log("===== LEXER TEST =====");

const lexical = tokenizeC(code);

console.log("Lexer Errors:");
console.log(lexical.errors);

console.log("\n===== PARSER TEST =====");

const syntax = parseC(lexical.tokens);

console.log("Parser Errors:");
console.log(syntax.errors);

console.log("\n===== AST =====");

console.log(
    JSON.stringify(syntax.ast, null, 2)
);