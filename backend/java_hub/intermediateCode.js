// intermediateCode.js


function generateIntermediateCode(ast){


    let instructions = [];

    let tempCount = 1;



    function newTemp(){

        return "t" + tempCount++;

    }




    function generate(node){


        if(!node)
            return;



        switch(node.type){



            case "Declaration":


                if(node.value){


                    let value =
                    generateExpression(node.value);



                    instructions.push(

                        `DECLARE ${node.dataType} ${node.name}`

                    );


                    instructions.push(

                        `ASSIGN ${node.name} ${value}`

                    );


                }


                else{


                    instructions.push(

                        `DECLARE ${node.dataType} ${node.name}`

                    );

                }


                break;







            case "Assignment":


                let assignValue =
                generateExpression(node.value);


                instructions.push(

                    `ASSIGN ${node.name} ${assignValue}`

                );


                break;








            case "Print":


                let printValue =
                generateExpression(node.expression);


                instructions.push(

                    `PRINT ${printValue}`

                );


                break;







            case "For":


                instructions.push(
                    "FOR_START"
                );


                generate(node.initialization);


                instructions.push(

                    `IF ${generateExpression(node.condition)}`

                );



                node.body.forEach(generate);



                generate(node.increment);



                instructions.push(

                    "FOR_END"

                );


                break;








            case "Function":


                instructions.push(

                    `FUNCTION ${node.name}`

                );


                node.body.forEach(generate);


                instructions.push(

                    "END_FUNCTION"

                );


                break;







            case "Return":


                instructions.push(

                    `RETURN ${generateExpression(node.value)}`

                );


                break;



        }


    }







    function generateExpression(expr){



        if(!expr)
            return null;



        if(expr.type==="Number"){

            return expr.value;

        }




        if(expr.type==="Identifier"){

            return expr.value;

        }





        if(expr.type==="BinaryExpression"){



            let left =
            generateExpression(expr.left);



            let right =
            generateExpression(expr.right);



            let temp =
            newTemp();



            instructions.push(

                `${temp} = ${left} ${expr.operator} ${right}`

            );



            return temp;


        }



    }






    ast.forEach(generate);



    return instructions;


}



module.exports = generateIntermediateCode;