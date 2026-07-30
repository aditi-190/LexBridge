const lexer = require("./lexer");

const code = `
int add(int a, int b){

    int sum = a + b;

    return sum;

}

int x = add(5,10);

if(x > 5){

    print(x);

}
`;

const tokens = lexer(code);

console.table(tokens);