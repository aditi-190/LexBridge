const { executeJava } = require("../../java_hub/executor");

const code = `
public class Main{

    public static void main(String[] args){

        int a=10;

        System.out.println(a);

    }

}
`;

const result=executeJava(code);

console.log(result);