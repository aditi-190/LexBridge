const { compileC } = require("./compileC");

const code = `
#include <stdio.h>

int add(int a, int b) {

    return a + b;

}

int main() {

    int i;
    int result;

    i = 1;

    while (i <= 3) {

        result = add(i, 10);

        printf("Result = %d\\n", result);

        i = i + 1;

    }

    return 0;
}
`;

const result = compileC(code);

console.log(
    JSON.stringify(
        result,
        null,
        2
    )
);