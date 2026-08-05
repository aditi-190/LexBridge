const runBtn = document.getElementById("runBtn");
const codeInput = document.getElementById("code");
const inputBox = document.getElementById("input");
const outputBox = document.getElementById("output");
const terminalStatus = document.getElementById("terminalStatus");

const languageBtn =
    document.getElementById("languageBtn");

const languageMenu =
    document.getElementById("languageMenu");

const currentLanguage =
    document.getElementById("currentLanguage");

const languageOptions =
    document.querySelectorAll(".language-option");

let selectedLanguage = "c";

function setStatus(
    text,
    type = "normal"
) {

    if (!terminalStatus) return;

    terminalStatus.textContent = text;

    if (type === "success") {

        terminalStatus.style.color =
            "#39d98a";

    }

    else if (type === "error") {

        terminalStatus.style.color =
            "#ff667c";

    }

    else if (type === "running") {

        terminalStatus.style.color =
            "#60a5fa";

    }

    else {

        terminalStatus.style.color =
            "#72839d";

    }
}


function showError(result) {

    let message = "";

    if (result.phase) {

        message +=
            `${result.phase}\n\n`;

    }


    if (
        Array.isArray(result.errors) &&
        result.errors.length > 0
    ) {

        message += result.errors
            .map(error => {

                const line =
                    error.line !== undefined
                        ? `Line ${error.line}: `
                        : "";

                return (
                    line +
                    (error.message || "Unknown error")
                );

            })
            .join("\n");

    }

    else if (result.error) {

        message += result.error;

    }

    else if (result.message) {

        message += result.message;

    }

    else {

        message +=
            "Compilation failed.";

    }


    outputBox.textContent = message;

    setStatus(
        "Error",
        "error"
    );

}

if (
    languageBtn &&
    languageMenu
) {

    languageBtn.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            languageMenu.classList.toggle(
                "show"
            );

        }
    );

}

languageOptions.forEach(option => {

    option.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            const language =
                option.dataset.language;

            selectedLanguage = language;


            let displayName = "C";
            let fileName = "main.c";


            if (language === "cpp") {

                displayName = "C++";
                fileName = "main.cpp";

            }

            else if (language === "java") {

                displayName = "Java";
                fileName = "Main.java";

            }

            else if (language === "python") {

                displayName = "Python";
                fileName = "main.py";

            }


            if (currentLanguage) {

                currentLanguage.textContent =
                    displayName;

            }


            languageOptions.forEach(item => {

                item.classList.remove(
                    "active"
                );

            });

            option.classList.add(
                "active"
            );


            const fileBadge =
                document.querySelector(
                    ".file-badge"
                );

            if (fileBadge) {

                fileBadge.textContent =
                    fileName;

            }


            const panelLanguage =
                document.querySelector(
                    ".panel-language"
                );

            if (panelLanguage) {

                panelLanguage.textContent =
                    displayName;

            }


            languageMenu.classList.remove(
                "show"
            );


            // Placeholder

            if (codeInput) {

                if (language === "c") {

                    codeInput.placeholder =
`int main() {

    print "Hello World";

    return 0;
}`;

                }

                else if (language === "cpp") {

                    codeInput.placeholder =
`#include <iostream>

using namespace std;

int main() {

    cout << "Hello World";

    return 0;
}`;

                }

                else if (language === "java") {

                    codeInput.placeholder =
`class Main {

    public static void main(String[] args) {

        System.out.println("Hello World");

    }

}`;

                }

                else if (language === "python") {

                    codeInput.placeholder =
`print("Hello World")`;

                }

            }


            if (language === "c") {

                outputBox.textContent =
                    'LexBridge C Compiler\n\n' +
                    'Write your code and click "Run Code".';

                setStatus(
                    "Ready",
                    "normal"
                );

            }

            else {

                outputBox.textContent =
                    `${displayName} compiler is not connected yet.`;

                setStatus(
                    "Not Connected",
                    "normal"
                );

            }

        }
    );

});


document.addEventListener(
    "click",
    function () {

        if (languageMenu) {

            languageMenu.classList.remove(
                "show"
            );

        }

    }
);


runBtn.addEventListener(
    "click",
    async function () {

        const code =
            codeInput.value.trim();

        const input =
            inputBox.value;


        // Empty code

        if (!code) {

            outputBox.textContent =
                "Please write some code first.";

            setStatus(
                "Waiting",
                "normal"
            );

            return;

        }


        // Only C connected

        if (selectedLanguage !== "c") {

            let name = "C++";

            if (selectedLanguage === "java") {

                name = "Java";

            }

            if (selectedLanguage === "python") {

                name = "Python";

            }

            outputBox.textContent =
                `${name} compiler is not connected yet.`;

            setStatus(
                "Not Connected",
                "normal"
            );

            return;

        }


        // Running state

        runBtn.disabled = true;

        runBtn.innerHTML =
            '<span class="run-icon">⏳</span> Running...';

        outputBox.textContent =
            "Connecting to LexBridge backend...";

        setStatus(
            "Connecting",
            "running"
        );


        try {

            const response = await fetch(
                "http://localhost:5000/api/c/compile",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        code: code,

                        input: input

                    })
                }
            );


            // ==================================
            // READ RESPONSE SAFELY
            // ==================================

            const contentType =
                response.headers.get(
                    "content-type"
                );


            let result;


            if (
                contentType &&
                contentType.includes(
                    "application/json"
                )
            ) {

                result =
                    await response.json();

            }

            else {

                const text =
                    await response.text();

                console.error(
                    "Non-JSON backend response:",
                    text
                );


                outputBox.textContent =
                    `Backend returned an unexpected response.\n\n` +
                    `HTTP ${response.status}\n\n` +
                    text;

                setStatus(
                    "Backend Error",
                    "error"
                );

                return;

            }


            console.log(
                "Compiler Response:",
                result
            );


            // ==================================
            // HTTP ERROR
            // ==================================

            if (!response.ok) {

                showError(result);

                return;

            }


            // ==================================
            // COMPILATION ERROR
            // ==================================

            if (!result.success) {

                showError(result);

                return;

            }


            // ==================================
            // SUCCESS
            // ==================================

            const programOutput =
                result.output ||
                result.programOutput ||
                "";


            if (
                typeof programOutput ===
                "string" &&
                programOutput.trim()
            ) {

                outputBox.textContent =
                    programOutput;

            }

            else {

                outputBox.textContent =
                    "Program finished successfully.\n\n" +
                    "No output.";

            }


            setStatus(
                "Success",
                "success"
            );

        }


        catch (error) {

            console.error(
                "Frontend → Backend Error:",
                error
            );


            outputBox.textContent =
                "Could not connect to LexBridge backend.\n\n" +
                `Error: ${error.message}\n\n` +
                "Check:\n" +
                "1. Backend is running on port 5000\n" +
                "2. /api/c/compile route exists\n" +
                "3. CORS is enabled in server.js";


            setStatus(
                "Disconnected",
                "error"
            );

        }


        finally {

            runBtn.disabled = false;

            runBtn.innerHTML =
                '<span class="run-icon">▶</span> Run Code';

        }

    }
);