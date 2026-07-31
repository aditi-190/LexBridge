const { tokenizeC } = require("./lexer");
const { parseC } = require("./parser");
const { generateTAC } = require("./tacGenerator");
const { executeProgram } = require("./programExecutor");
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

console.log("===== EXECUTOR TEST =====");

console.log("\nLexer Errors:");

console.log(
    JSON.stringify(
        lexical.errors,
        null,
        2
    )
);

const syntax = parseC(
    lexical.tokens
);

console.log("\nParser Errors:");

console.log(
    JSON.stringify(
        syntax.errors,
        null,
        2
    )
);

if (
    lexical.errors.length > 0 ||
    syntax.errors.length > 0
) {

    console.log(
        "\nCannot execute because compilation has errors."
    );

    process.exit(1);

}


const ast = syntax.ast;

const tacResult =
    generateTAC(ast);


console.log("\nTAC:");


if (
    tacResult &&
    Array.isArray(tacResult.code)
) {

    console.log(
        tacResult.code.join("\n")
    );

} else {

    console.log(
        "TAC generation failed."
    );

    process.exit(1);

}
const execution =
    executeProgram(ast);
console.log(
    "\n===== PROGRAM OUTPUT ====="
);


if (!execution) {

    console.log(
        "Program execution returned no result."
    );

    process.exit(1);

}


if (!execution.success) {

    console.log(
        `Execution Error: ${
            execution.error || "Unknown error"
        }`
    );

    process.exit(1);

}


console.log(
    execution.output || "No output."
);


if (
    execution.result !== undefined &&
    execution.result !== null
) {

    console.log(
        "\nReturn Value:",
        execution.result
    );

}

if (execution.variables) {

    console.log(
        "\nVariables:"
    );

    console.log(
        JSON.stringify(
            execution.variables,
            null,
            2
        )
    );

}