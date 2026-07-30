const Parser = require("./parser");
const SemanticAnalyzer = require("./semanticAnalyzer");
const code = `
int add(int a, int b) {
    return a + b;
}

int x = 10;
x = "Hello"; // Type Mismatch Error

int result = add(x, 20);
print(y); // Undeclared Variable Error 'y'
`;

try {
    const parser = new Parser(code);
    const ast = parser.parseProgram();

    const analyzer = new SemanticAnalyzer();
    const result = analyzer.analyze(ast);

    if (result.isValid) {
        console.log(" Semantic Analysis Passed!");
    } else {
        console.log(" Semantic Errors Found:");
        result.errors.forEach(err => console.log(` - ${err}`));
    }
} catch (err) {
    console.error("Parser Error:", err.message);
}