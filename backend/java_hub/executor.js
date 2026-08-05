function executor(ast, input = ""){
    let variables = {};

    let functions = {};

    let output = [];

    function executeProgram(statements){


        statements.forEach(statement=>{

            execute(statement);

        });


    }
    function execute(node){
        if(!node)
            return null;

        switch(node.type){



            case "Declaration":


                variables[node.name] =
                evaluate(node.value);


                break;
          case "Assignment":


                variables[node.name] =
                evaluate(node.value);

                break;
            case "Print":

                output.push(
                    evaluate(node.expression)
                );
                break;
            case "BinaryExpression":


                return evaluate(node);

            case "If":
                if(
                    evaluate(node.condition)
                ){


                    node.body.forEach(execute);


                }

                else if(node.elseBody){


                    node.elseBody.forEach(execute);


                }


                break;
            case "While":


                while(
                    evaluate(node.condition)
                ){


                    node.body.forEach(execute);


                }


                break;
            case "For":



                execute(
                    node.initialization
                );



                while(
                    evaluate(node.condition)
                ){


                    node.body.forEach(execute);



                    execute(
                        node.increment
                    );


                }
                break;
            case "Increment":


                variables[node.name]++;


                break;
            case "Function":



                functions[node.name]={


                    params:node.params,


                    body:node.body


                };


                break;

            case "FunctionCall":


                return callFunction(node);



            case "Return":


                return evaluate(node.value);

        }

    }

    function callFunction(node){



        let func =
        functions[node.name];



        if(!func)
            return null;



        let oldVariables =
        {...variables};




        func.params.forEach(
            (param,index)=>{


                variables[param] =
                evaluate(node.args[index]);


            }
        );




        let result=null;




        for(let statement of func.body){


            if(statement.type==="Return"){


                result =
                execute(statement);


                break;


            }


            execute(statement);


        }




        variables =
        oldVariables;



        return result;


    }









    function evaluate(expr){



        if(expr===null)
            return null;



        if(typeof expr==="number")
            return expr;




        if(typeof expr==="string"){

            if(
                variables[expr] !== undefined
            ){

                return variables[expr];

            }


            return expr;

        }







        switch(expr.type){



            case "Number":

                return expr.value;







            case "Identifier":


                return variables[expr.value];








            case "BinaryExpression":



                let left =
                evaluate(expr.left);



                let right =
                evaluate(expr.right);




                switch(expr.operator){



                    case "+":
                        return left + right;


                    case "-":
                        return left - right;


                    case "*":
                        return left * right;


                    case "/":
                        return left / right;



                    case "<":
                        return left < right;



                    case ">":
                        return left > right;



                    case "==":
                        return left == right;



                    case "!=":
                        return left != right;



                    case "<=":
                        return left <= right;



                    case ">=":
                        return left >= right;


                }


        }



    }
executeProgram(ast);
return output.join("\n");


}
module.exports = executor;