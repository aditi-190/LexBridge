const { tokenizeCpp } = require("./lexer");
const { parseCpp } = require("./parser");
const { generateTAC } = require("./tacGenerator");

const code = `
int add(int a, int b) {

    int sum;

    sum = a + b;

    return sum;

}

int main() {

    int result;

    result = add(10, 20);

    cout << "Result = " << result << endl;

    return 0;

}
`;

const lexical = tokenizeCpp(code);

const syntax = parseCpp(lexical.tokens);

console.log("========== LEXER ==========");

console.log("Lexer Errors:");

console.log(lexical.errors);

console.log("\n========== PARSER ==========");

console.log("Parser Errors:");

console.log(syntax.errors);

if (

    lexical.errors.length === 0 &&

    syntax.errors.length === 0

) {

    const tac = generateTAC(syntax.ast);

    console.log("\n========== THREE ADDRESS CODE ==========\n");

    console.log(

        tac.code.join("\n")

    );

}