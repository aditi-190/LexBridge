const lexer=require("../../java_hub/lexer");
const parser=require("../../java_hub/parser");
const semantic=require("../../java_hub/semanticAnalyzer");
const executor=require("../../java_hub/executor");


let code=`

int a = 10;


for(i=0;i<5;i++){

print(i);

}

`;


let tokens=lexer(code);

let ast=parser(tokens);


let check=semantic(ast);


console.log(check);


if(check.success){

    let result=executor(ast);

    console.log("Output:");
    console.log(result);

}