const runBtn = document.getElementById("runBtn");
const saveBtn = document.getElementById("saveBtn");
const shareBtn = document.getElementById("shareBtn");

const code = document.getElementById("code");
const inputBox = document.getElementById("input");
const output = document.getElementById("output");


// =========================
// RUN BUTTON
// =========================

runBtn.addEventListener("click", async () => {

    const sourceCode = code.value;
    const programInput = inputBox.value;

    if (sourceCode.trim() === "") {

        output.textContent = "Please write C++ code first.";
        return;

    }

    output.textContent = "Running Program...";

    try {

        console.log("Run button clicked");
        console.log("Source Code:", sourceCode);
        console.log("Program Input:", programInput);

        const response = await fetch("http://localhost:5000/api/cpp/run", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                code: sourceCode,

                input: programInput

            })

        });

        const result = await response.json();

        console.log("Backend Response:", result);

        if (!response.ok) {

            output.textContent =
                result.error || "Server Error";

            return;

        }

        output.textContent =
            result.output || "Program finished.";

    }

    catch (error) {

        console.error("Frontend Error:", error);

        output.textContent =
            "Cannot connect to backend server.";

    }

});


// =========================
// SAVE BUTTON
// =========================

saveBtn.addEventListener("click", () => {

    const blob = new Blob(

        [code.value],

        {

            type: "text/plain"

        }

    );

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = "program.cpp";

    link.click();

});


// =========================
// SHARE BUTTON
// =========================

shareBtn.addEventListener("click", async () => {

    try {

        await navigator.clipboard.writeText(code.value);

        alert("Code copied to clipboard.");

    }

    catch (err) {

        alert("Clipboard access failed.");

    }

});