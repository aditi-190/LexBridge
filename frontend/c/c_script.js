const runBtn = document.getElementById("runBtn");

const tabButtons = document.querySelectorAll(".tab-btn");

const tabContents = document.querySelectorAll(".tab-content");


// ==========================================
// TAB SWITCHING
// ==========================================

tabButtons.forEach(button => {

    button.addEventListener("click", () => {

        const tabName = button.dataset.tab;

        tabButtons.forEach(btn => {

            btn.classList.remove("active");

        });

        tabContents.forEach(content => {

            content.classList.remove("active");

        });

        button.classList.add("active");

        const selectedTab = document.getElementById(
            `${tabName}Tab`
        );

        if (selectedTab) {

            selectedTab.classList.add("active");

        }

    });

});


// ==========================================
// RUN COMPILER
// ==========================================

runBtn.addEventListener("click", async () => {

    const code = document.getElementById("code").value;

    const outputBox = document.getElementById("output");

    const tokensOutput = document.getElementById("tokensOutput");

    const astOutput = document.getElementById("astOutput");

    const symbolOutput = document.getElementById("symbolOutput");

    const semanticOutput = document.getElementById("semanticOutput");

    const tacOutput = document.getElementById("tacOutput");


    if (!code.trim()) {

        outputBox.innerText =
            "Please write C code first.";

        return;

    }


    outputBox.innerText =
        "Compiling program...";


    try {

        const response = await fetch(
            "http://localhost:5000/api/c/compile",
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    code: code

                })

            }
        );


        const result = await response.json();

        console.log("Compiler Result:", result);


        // ==========================================
        // DISPLAY TOKENS
        // ==========================================

        if (result.tokens) {

            tokensOutput.innerText =
                JSON.stringify(
                    result.tokens,
                    null,
                    2
                );

        } else {

            tokensOutput.innerText =
                "No token information.";

        }


        // ==========================================
        // DISPLAY AST
        // ==========================================

        if (result.ast) {

            astOutput.innerText =
                JSON.stringify(
                    result.ast,
                    null,
                    2
                );

        } else {

            astOutput.innerText =
                "No AST generated.";

        }


        
        // DISPLAY SYMBOL TABLE
        

        if (result.symbolTable) {

            symbolOutput.innerText =
                JSON.stringify(
                    result.symbolTable,
                    null,
                    2
                );

        } else {

            symbolOutput.innerText =
                "No symbol table.";

        }
        
        // DISPLAY SEMANTIC RESULT
       
        if (result.semanticErrors) {

            if (result.semanticErrors.length === 0) {

                semanticOutput.innerText =
                    "No semantic errors.";

            } else {

                semanticOutput.innerText =
                    JSON.stringify(
                        result.semanticErrors,
                        null,
                        2
                    );

            }

        } else if (result.errors) {

            semanticOutput.innerText =
                JSON.stringify(
                    result.errors,
                    null,
                    2
                );

        } else {

            semanticOutput.innerText =
                "No semantic information.";

        }

        // DISPLAY TAC
        
        if (result.tac) {

            if (Array.isArray(result.tac)) {

                tacOutput.innerText =
                    result.tac.join("\n");

            } else {

                tacOutput.innerText =
                    result.tac;

            }

        } else {

            tacOutput.innerText =
                "No TAC generated.";

        }

        // MAIN OUTPUT
        

        if (result.success) {

            outputBox.innerText =
                "Compilation Successful\n\n" +
                "All available compiler phases completed.";

        } else {

            let message =
                "Compilation Failed\n\n";

            if (result.phase) {

                message +=
                    `Phase: ${result.phase}\n\n`;

            }

            if (result.errors) {

                message += result.errors
                    .map(error => {

                        if (error.line) {

                            return `Line ${error.line}: ${error.message}`;

                        }

                        return error.message;

                    })
                    .join("\n");

            }

            else if (result.error) {

                message += result.error;

            }

            else {

                message += "Unknown compiler error.";

            }

            outputBox.innerText = message;

        }

    }

    catch (error) {

        console.error(
            "Frontend Connection Error:",
            error
        );

        outputBox.innerText =
            "❌ Could not connect to LexBridge backend.\n\n" +
            "Make sure the backend server is running on port 5000.";

    }

});