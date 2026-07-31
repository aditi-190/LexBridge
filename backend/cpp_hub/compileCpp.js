const folder = path.join(__dirname, "../cpp_hub");

const cppFile = path.join(folder, "input.cpp");

const exeFile = path.join(
    folder,
    `program_${Date.now()}.exe`
);

const inputFile = path.join(folder, "input.txt");

fs.writeFileSync(cppFile, code);

fs.writeFileSync(inputFile, input || "");


exec(

    `"${exeFile}" < "${inputFile}"`,

    (runError, stdout, stderr) => {

    
        if (fs.existsSync(exeFile)) {
            try {
                fs.unlinkSync(exeFile);
            } catch (err) {
                console.log("Could not delete exe:", err.message);
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

            output: stdout

        });

    }

);