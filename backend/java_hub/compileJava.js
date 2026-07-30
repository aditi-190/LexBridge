// backend/java_hub/compileJava.js
const lexer = require("./lexer");
const Parser = require("./parser");
const SemanticAnalyzer = require("./semanticAnalyzer");
const TACGenerator = require("./tacGenerator");
const Optimizer = require("./optimizer");
const TargetCodeGenerator = require("./targetCodeGenerator");

function compileJava(sourceCode) {
    const response = {
        success: false,
        tokens: [],
        ast: null,
        semantic: { isValid: false, errors: [] },
        tac: [],
        optimizedTac: [],
        targetCode: "",
        error: null
    };

    try {
        // Phase 1: Lexical Analysis
        response.tokens = lexer(sourceCode);

        // Phase 2: Syntax Analysis
        const parser = new Parser(sourceCode);
        const ast = parser.parseProgram();
        response.ast = ast;

        // Phase 3: Semantic Analysis
        const analyzer = new SemanticAnalyzer();
        const semanticResult = analyzer.analyze(ast);
        response.semantic = semanticResult;

        if (!semanticResult.isValid) {
            response.error = "Semantic Analysis Failed";
            return response;
        }

        // Phase 4: TAC Generation
        const tacGen = new TACGenerator();
        const rawTAC = tacGen.generate(ast);
        response.tac = tacGen.toStringArray();

        // Phase 5: Optimization
        const optimizer = new Optimizer(rawTAC);
        const optimizedTAC = optimizer.optimize();
        tacGen.instructions = optimizedTAC;
        response.optimizedTac = tacGen.toStringArray();

        // Phase 6: Assembly Generation
        const targetGen = new TargetCodeGenerator();
        targetGen.generate(optimizedTAC);
        response.targetCode = targetGen.toString();

        response.success = true;
        return response;

    } catch (err) {
        response.error = err.message;
        return response;
    }
}

module.exports = compileJava;