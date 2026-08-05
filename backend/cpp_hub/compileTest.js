const { compileCpp } = require("./compileCpp");

const code = `
#include <iostream>
using namespace std;

int main() {

    int a;
    int b;
    int c;

    a = 5;
    b = 10;
    c = a + b * 2;

    cout << c << endl;

    return 0;

}
`;

const result = compileCpp(code);

console.log(

    JSON.stringify(result, null, 2)

);