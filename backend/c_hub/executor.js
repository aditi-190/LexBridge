const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function executeC(sourceCode) {

    const folder = path.join(__dirname, "temp");

    if (!fs.existsSync(folder)) {

        fs.mkdirSync(folder);

    }

    const filePath = path.join(folder, "input.c");

    fs.writeFileSync(filePath, sourceCode);

    try {

        const outputFile = path.join(folder, "program");

        
        execSync(`gcc "${filePath}" -o "${outputFile}"`);

        
        const output = execSync(`"${outputFile}"`).toString();

        return {

            success: true,

            output,

            error: null

        };

    }

    catch (err) {

        return {

            success: false,

            output: "",

            error: err.toString()

        };

    }

}

module.exports = {

    executeC

};