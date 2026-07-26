const { tokenizeJava } = require("../../java_hub/lexer");
const { parseJava } = require("../../java_hub/parser");

const code = `
public class Main {
    public static void main(String[] args) {
        int a = 10;
        a = a + 5;
    }
}
`;

const lexical = tokenizeJava(code);
const syntax = parseJava(lexical.tokens);

console.log(JSON.stringify(syntax, null, 2));