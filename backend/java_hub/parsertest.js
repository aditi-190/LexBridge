const Parser = require("./parser");

const code = `
add(5,10);
`;

const parser = new Parser(code);

const ast = parser.parseProgram();

console.log(JSON.stringify(ast, null, 4));