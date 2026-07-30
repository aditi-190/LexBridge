const Parser = require("./parser");
const SemanticAnalyzer = require("./semanticAnalyzer");
const TACGenerator = require("./tacGenerator");
const Optimizer = require("./optimizer");

const code = `
int add(int a, int b) {
    int sum = a + b;
    return sum;
}

int x = add(5, 10);
int constantCalc = 10 + 20 * 2; 

if (x > 5) {
    print(x);
}
`;

try {
    const parser = new Parser(code);
    const ast = parser.parseProgram();

    const analyzer = new SemanticAnalyzer();
    analyzer.analyze(ast);

    const generator = new TACGenerator();
    const rawTAC = generator.generate(ast);

    console.log("=== ORIGINAL TAC ===");
    generator.toStringArray().forEach((line, idx) => console.log(`${idx + 1}.\t${line}`));

    const optimizer = new Optimizer(rawTAC);
    generator.instructions = optimizer.optimize();

    console.log("\n=== OPTIMIZED TAC ===");
    generator.toStringArray().forEach((line, idx) => console.log(`${idx + 1}.\t${line}`));

} catch (err) {
    console.error("Error:", err.message);
}