const Parser = require("./parser");
const SemanticAnalyzer = require("./semanticAnalyzer");
const TACGenerator = require("./tacGenerator");
const Optimizer = require("./optimizer");
const TargetCodeGenerator = require("./targetCodeGenerator");

const sourceCode = `
int add(int a, int b) {
    int sum = a + b;
    return sum;
}

int x = add(5, 10);

if (x > 5) {
    print(x);
}
`;

console.log("=========================================");
console.log("          LEXBRIDGE COMPILER             ");
console.log("=========================================\n");

try {
    // 1. Parsing & AST Generation
    console.log("[Phase 1 & 2] Lexical & Syntax Analysis...");
    const parser = new Parser(sourceCode);
    const ast = parser.parseProgram();
    console.log("  AST Generated Successfully!\n");

    // 2. Semantic Analysis
    console.log("[Phase 3] Semantic Analysis...");
    const analyzer = new SemanticAnalyzer();
    const semResult = analyzer.analyze(ast);
    if (!semResult.isValid) {
        console.log("❌ Semantic Errors Found:", semResult.errors);
        process.exit(1);
    }
    console.log("  Semantic Check Passed! No errors found.\n");

    // 3. Intermediate Code Generation
    console.log("[Phase 4] Intermediate Code Generation (TAC)...");
    const tacGen = new TACGenerator();
    const rawTAC = tacGen.generate(ast);
    console.log("  Raw TAC Generated.\n");

    // 4. Optimization
    console.log("[Phase 5] Code Optimization...");
    const optimizer = new Optimizer(rawTAC);
    const optimizedTAC = optimizer.optimize();
    tacGen.instructions = optimizedTAC;
    console.log("  TAC Optimized Successfully!\n");

    // 5. Target Code Generation
    console.log("[Phase 6] Target Code Generation (Assembly)...");
    const targetGen = new TargetCodeGenerator();
    targetGen.generate(optimizedTAC);
    console.log("  Assembly Code Generated!\n");

    console.log("=========================================");
    console.log("          FINAL ASSEMBLY CODE            ");
    console.log("=========================================");
    console.log(targetGen.toString());

} catch (err) {
    console.error("Compiler Fatal Error:", err.message);
}