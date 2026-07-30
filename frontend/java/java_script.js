const runBtn = document.getElementById("runBtn");
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

// 1. Tab Navigation Logic
tabButtons.forEach(button => {
    button.addEventListener("click", () => {
        const tabName = button.dataset.tab;

        tabButtons.forEach(btn => btn.classList.remove("active"));
        tabContents.forEach(content => content.classList.remove("active"));

        button.classList.add("active");

        const selectedTab = document.getElementById(`${tabName}Tab`);
        if (selectedTab) {
            selectedTab.classList.add("active");
        }
    });
});

// Helper Function: Formats raw objects into clean JSON strings
function formatData(data) {
    if (!data) return null;
    if (typeof data === "object") {
        return JSON.stringify(data, null, 2);
    }
    return data;
}

// Helper Function: Cleans extra headers/comments from Assembly Code
function cleanAssemblyCode(code) {
    if (!code || typeof code !== "string") return code;

    return code
        .split('\n')
        .filter(line => {
            const trimmed = line.trim();
            return !trimmed.startsWith('; --- Generated Assembly') &&
                   !trimmed.startsWith('section .text') &&
                   !trimmed.startsWith('global _start');
        })
        .join('\n')
        .trim(); // ওপরের ফাঁকা জায়গা রিমুভ করবে
}

// Helper Function: Formats Tokens array into "Line X: TYPE -> Value" format
function formatTokensWithLineNumbers(tokensData) {
    if (!tokensData) return "No token information.";

    let tokenArray = tokensData;
    
    if (!Array.isArray(tokensData) && typeof tokensData === 'object') {
        tokenArray = tokensData.tokens || [];
    }

    if (!Array.isArray(tokenArray) || tokenArray.length === 0) {
        return typeof tokensData === 'string' ? tokensData : JSON.stringify(tokensData, null, 2);
    }

    return tokenArray.map(token => {
        let line = token.line || 1;
        let type = token.type || token.tokenType || "TOKEN";
        let value = token.value || token.lexeme || token.text || "";
        return `Line ${line}: ${type} -> ${value}`;
    }).join('\n');
}

// Helper Function: Render Symbol Table as HTML Table
function renderSymbolTable(data) {
    if (!data) return "No symbol table data.";

    let symbols = data.symbols || data;

    if (typeof symbols !== "object" || Object.keys(symbols).length === 0) {
        return "No symbols found.";
    }

    let tableHTML = `
        <div class="symbol-table-wrapper">
            <table class="styled-table">
                <thead>
                    <tr>
                        <th>Identifier</th>
                        <th>Category</th>
                        <th>Type</th>
                        <th>Parameters / Extra Details</th>
                    </tr>
                </thead>
                <tbody>
    `;

    for (const [name, info] of Object.entries(symbols)) {
        let category = info.category || "Variable";
        let type = info.dataType || info.returnType || "N/A";
        
        let extraInfo = "-";
        if (info.params) {
            if (Array.isArray(info.params)) {
                extraInfo = info.params.map(p => p.dataType || p.type || JSON.stringify(p)).join(", ");
            } else {
                extraInfo = JSON.stringify(info.params);
            }
        } else if (info.scope) {
            extraInfo = info.scope;
        }

        tableHTML += `
            <tr>
                <td><strong style="color: #38bdf8;">${name}</strong></td>
                <td>${category}</td>
                <td><code style="color: #a7f3d0;">${type}</code></td>
                <td>${extraInfo}</td>
            </tr>
        `;
    }

    tableHTML += `
                </tbody>
            </table>
        </div>
    `;

    return tableHTML;
}

// 2. Compilation Request Logic
runBtn.addEventListener("click", async () => {
    const code = document.getElementById("code").value;
    const outputBox = document.getElementById("output");
    const tokensOutput = document.getElementById("tokensOutput");
    const astOutput = document.getElementById("astOutput");
    const symbolTab = document.getElementById("symbolTab");
    const semanticOutput = document.getElementById("semanticOutput");
    const tacOutput = document.getElementById("tacOutput");

    if (!code.trim()) {
        outputBox.innerText = "Please write Java code first.";
        return;
    }

    outputBox.innerText = "Compiling Java program...";

    try {
        const response = await fetch("http://localhost:5000/api/java/compile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ code: code })
        });

        const result = await response.json();
        console.log("Java Compiler Result:", result);

        // Cleaned Assembly Code Output
        if (result.targetCode) {
            tacOutput.innerText = cleanAssemblyCode(formatData(result.targetCode));
        } else if (result.output) {
            tacOutput.innerText = cleanAssemblyCode(formatData(result.output));
        } else {
            tacOutput.innerText = "No Assembly generated.";
        }

        // Tokens Output (Formatted View)
        if (result.tokens) {
            tokensOutput.innerText = formatTokensWithLineNumbers(result.tokens);
        } else {
            tokensOutput.innerText = "No token information.";
        }

        // AST Output
        if (result.ast) {
            astOutput.innerText = formatData(result.ast);
        } else {
            astOutput.innerText = "No AST generated.";
        }

        // Symbol Table Output (Table View)
        if (result.symbolTable) {
            symbolTab.innerHTML = renderSymbolTable(result.symbolTable);
        } else {
            symbolTab.innerHTML = "<pre>No symbol table.</pre>";
        }

        // Semantic Errors Output
        if (result.semanticErrors) {
            semanticOutput.innerText = result.semanticErrors.length === 0 
                ? "No semantic errors." 
                : formatData(result.semanticErrors);
        } else {
            semanticOutput.innerText = "No semantic information.";
        }

        // Compilation Result Status
        if (result.success) {
            outputBox.innerText = "Compilation Successful!\n\n" + (result.message || "All compilation phases executed.");
        } else {
            outputBox.innerText = "Compilation Failed\n\n" + (result.message || "Unknown error occurred.");
        }

    } catch (error) {
        console.error("Frontend Connection Error:", error);
        outputBox.innerText = "❌ Could not connect to LexBridge backend.\n\n" +
                              "Make sure the server is running on port 5000.";
    }
});