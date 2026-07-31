const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

async function compileCpp(code, input) {

    return new Promise((resolve) => {

        const folder = path.join(__dirname, "../cpp_hub");

        const cppFile = path.join(folder, "input.cpp");

        // Every run creates a new exe
        const exeFile = path.join(
            folder,
            `program_${Date.now()}.exe`
        );

        const inputFile = path.join(folder, "input.txt");

        fs.writeFileSync(cppFile, code);

        fs.writeFileSync(inputFile, input || "");

console.log("CPP FILE:", cppFile);

console.log("INPUT FILE:", inputFile);

console.log("EXE FILE:", exeFile);
console.log("Compiling...");
        exec(

            `g++ "${cppFile}" -o "${exeFile}"`,

            (compileError) => {

                if (compileError) {

                    resolve({

                        success: false,

                        output: compileError.message

                    });

                    return;

                }
console.log("Compilation Successful");

console.log("Running Program...");
                exec(

                    `"${exeFile}" < "${inputFile}"`,

                    (runError, stdout, stderr) => {

                        // delete exe after execution
                        if (fs.existsSync(exeFile)) {

                            try {

                                fs.unlinkSync(exeFile);

                            }

                            catch (err) {

                                console.log(err.message);

                            }

                        }

                        if (runError) {

                            resolve({

                                success: false,

                                output: runError.message

                            });

                            return;

                        }

                        resolve({

                            success: true,

                            output: stdout || stderr

                        });

                    }

                );

            }

        );

    });

}

module.exports = compileCpp;