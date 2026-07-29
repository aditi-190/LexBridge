const { compileC } = require("../c_hub/compileC");

function runCompiler(sourceCode) {

    return compileC(sourceCode);

}

module.exports = {

    runCompiler

};