const { tokenizeCPP } = require("./lexer");
const { parseCPP } = require("./parser");
const { analyzeSemantic } = require("./semanticAnalyzer");

const code = `
int add(int a, int b)
{
    int result;

    result = a + b;

    return result;
}

int main()
{
    int x;

    x = add(10, 20);

    cout << "Result = " << x << endl;

    return 0;
}
`;

// ===============================
// LEXICAL ANALYSIS
// ===============================

const lexical = tokenizeCPP(code);

// ===============================
// PARSER
// ===============================

const syntax = parseCPP(
    lexical.tokens
);

// ===============================
// SEMANTIC ANALYSIS
// ===============================

const semantic =
    analyzeSemantic(
        syntax.ast
    );

console.log(
    "\n===== C++ SEMANTIC TEST ====="
);

console.log(
    "\nLexer Errors:"
);

console.log(
    JSON.stringify(
        lexical.errors,
        null,
        2
    )
);

console.log(
    "\nParser Errors:"
);

console.log(
    JSON.stringify(
        syntax.errors,
        null,
        2
    )
);

console.log(
    "\nSemantic Errors:"
);

console.log(
    JSON.stringify(
        semantic.errors,
        null,
        2
    )
);

console.log(
    "\nSymbol Table:"
);

console.log(
    JSON.stringify(
        semantic.symbolTable,
        null,
        2
    )
);