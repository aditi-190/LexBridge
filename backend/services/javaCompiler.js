const compileJava = require("../java_hub/compileJava");

function runJavaCompiler(code, input) {
    return compileJava(code, input);
}

module.exports = {
    runJavaCompiler
};