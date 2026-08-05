const { tokenizeCPP } = require("./lexer");
const { parseCPP } = require("./parser");
const { executeProgram } = require("./programExecutor");

const code = `
int add(int a, int b)
{
    return a + b;
}

int main()
{
    int result;

    result = add(10,20);

    cout << "Result = " << result << endl;

    return 0;
}
`;

console.log("========== EXECUTOR TEST ==========\n");

// Lexer
const lexical = tokenizeCPP(code);

console.log("Lexer Errors:");
console.log(
    JSON.stringify(
        lexical.errors,
        null,
        2
    )
);

// Parser
const syntax = parseCPP(
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

// Stop if compiler errors exist
if (
    lexical.errors.length > 0 ||
    syntax.errors.length > 0
) {

    console.log(
        "\nCompilation failed."
    );

    process.exit(1);

}

// Execute
const execution =
    executeProgram(
        syntax.ast
    );

console.log(
    "\n========== PROGRAM OUTPUT ==========\n"
);

if (!execution.success) {

    console.log(
        "Execution Error:"
    );

    console.log(
        execution.error
    );

}
else {

    console.log(
        execution.output
    );

    console.log(
        "\nReturn Value:",
        execution.result
    );

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