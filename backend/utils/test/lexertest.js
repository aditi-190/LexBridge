const { tokenizeJava } = require("../../java_hub/lexer");

const code = `
public class Main {
    public static void main(String[] args) {
        int a = 10;
        a = a + 5;
    }
}
`;

const result = tokenizeJava(code);

console.log(JSON.stringify(result, null, 2));