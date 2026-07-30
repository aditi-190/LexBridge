const { tokenizeC } = require("./lexer");
const { parseC } = require("./parser");
const { generateTAC } = require("./tacGenerator");

const code = `
int main() {

    int a;
    int b;
    int c;

    a = 5;
    b = 10;
    c = a + b * 2;

    return 0;
}
`;

const lexical = tokenizeC(code);

const syntax = parseC(lexical.tokens);

console.log("Parser Errors:");
console.log(syntax.errors);

const tac = generateTAC(syntax.ast);

console.log("\n===== THREE ADDRESS CODE =====");

console.log(
    tac.code.join("\n")
);