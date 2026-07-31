const { tokenizeC } = require("./lexer");
const { parseC } = require("./parser");
const { generateTAC } = require("./tacGenerator");

const code = `
int add(int a, int b) {

    return a + b;

}

int main() {

    int result;

    result = add(10, 20);

    print "Result:";
    print result;

    return 0;
}
`;

const lexical = tokenizeC(code);

const syntax = parseC(lexical.tokens);

console.log("Lexer Errors:");
console.log(lexical.errors);

console.log("\nParser Errors:");
console.log(syntax.errors);

if (
    lexical.errors.length === 0 &&
    syntax.errors.length === 0
) {

    const tac = generateTAC(syntax.ast);

    console.log("\n===== TAC =====");

    console.log(
        tac.code.join("\n")
    );

}