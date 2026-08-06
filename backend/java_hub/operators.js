module.exports = [
    "==",
    "!=",
    ">=",
    "<=",
    "&&",
    "||",
    "++",
    "--",

    // FIX: compound assignment operators (+=, -=, *=, /=, %=) didn't
    // exist at all — the lexer would tokenize "i += 2" as separate
    // "+" and "=" tokens, which the parser couldn't make sense of.
    // These must come before the single-char "+", "-", etc. below,
    // since matchOperator() picks the first entry that matches — a
    // shorter operator listed first would "win" over the longer one.
    "+=",
    "-=",
    "*=",
    "/=",
    "%=",

    "+",
    "-",
    "*",
    "/",
    "%",
    "=",
    ">",
    "<",
    "!"
];