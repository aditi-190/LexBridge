const { compileCpp } = require("../cpp_hub/compileCpp");

function runCppCompiler(sourceCode, input="") {

    return compileCpp(sourceCode, input);

}

module.exports = {

    runCppCompiler

};