const { compileC } = require("./compileC");

const code = `
int main() {

    int a;
    int b;
    int c;

    a = 5;
    b = 10;
    c = a + b * 2;

    return 0;
}
`;

const result = compileC(code);

console.log(
    JSON.stringify(result, null, 2)
);