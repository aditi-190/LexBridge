const compileJava =
require("../../java_hub/compileJava");



let code = `

int a = 10;


print(a);


for(i=0;i<5;i++){

print(i);

}

`;



let result =
compileJava(code);



console.log(
    JSON.stringify(
        result,
        null,
        2
    )
);