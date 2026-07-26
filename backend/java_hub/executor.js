const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function executeJava(sourceCode) {

    const folder = path.join(__dirname, "temp");

    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }

    const filePath = path.join(folder, "Main.java");

    fs.writeFileSync(filePath, sourceCode);

    try {

        // Compile
        execSync(`javac "${filePath}"`);

        // Run
        const output = execSync(
            `java -cp "${folder}" Main`
        ).toString();

        return {
            success: true,
            output: output,
            error: null
        };

    }
    catch(err){

        return{
            success:false,
            output:"",
            error:err.toString()
        };

    }

}

module.exports={
    executeJava
};