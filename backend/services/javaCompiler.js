const compileJava = require("../java_hub/compileJava");

function runJavaCompiler(code) {
    return compileJava(code);
}

module.exports = {
    runJavaCompiler
};