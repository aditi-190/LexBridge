const Parser = require("./parser");
const SemanticAnalyzer = require("./semanticAnalyzer");
const TACGenerator = require("./tacGenerator");

const code = `
int add(int a, int b) {
    int sum = a + b;
    return sum;
}

int x = add(5, 10);

if (x > 5) {
    print(x);
}
`;

try {
    const parser = new Parser(code);
    const ast = parser.parseProgram();

    const analyzer = new SemanticAnalyzer();
    const semResult = analyzer.analyze(ast);

    if (!semResult.isValid) {
        console.log("Semantic Errors:", semResult.errors);
    } else {
        const generator = new TACGenerator();
        generator.generate(ast);

        console.log("=== Generated Three Address Code (TAC) ===");
        const tacLines = generator.toStringArray();
        tacLines.forEach((line, index) => {
            console.log(`${index + 1}.\t${line}`);
        });
    }
} catch (err) {
    console.error("Error:", err.message);
}