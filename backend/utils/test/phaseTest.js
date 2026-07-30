const lexer=require("../../java_hub/lexer");
const parser=require("../../java_hub/parser");
const semantic=require("../../java_hub/semanticAnalyzer");
const generateIC=require("../../java_hub/intermediateCode");
const optimize=require("../../java_hub/optimizer");


let code=`

int a=10;

int b=20;

print(a+b);

`;



let tokens=lexer(code);

let ast=parser(tokens);


let check=semantic(ast);



if(check.success){


    let ic =
    generateIC(ast);



    console.log("Intermediate Code:");

    console.log(ic);



    let optimized =
    optimize(ic);



    console.log("\nOptimized Code:");

    console.log(optimized);


}