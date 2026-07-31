const { tokenizeC } = require("./lexer");
const { parseC } = require("./parser");

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

console.log("===== LEXER TEST =====");

console.log("Lexer Errors:");

console.log(
    JSON.stringify(lexical.errors, null, 2)
);

const syntax = parseC(lexical.tokens);

console.log("\n===== PARSER TEST =====");

console.log("Parser Errors:");

console.log(
    JSON.stringify(syntax.errors, null, 2)
);


console.log("\n===== AST =====");

console.log(
    JSON.stringify(
        syntax.ast,
        null,
        2
    )
);