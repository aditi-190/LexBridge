const compileJava = require("./compileJava");

const code = `public class Main {
    public static void main(String[] args) {
        int i = 5;
        i++;
        System.out.println(i);
        i--;
        i--;
        System.out.println(i);
    }
}`;

const result = compileJava(code, "");
console.log(JSON.stringify(result, null, 2));