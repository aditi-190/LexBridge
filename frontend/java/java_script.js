document.addEventListener("DOMContentLoaded", () => {
  const runBtn = document.getElementById("runBtn");

<<<<<<< HEAD
  if (!runBtn) return;
=======
tabButtons.forEach(button => {
    button.addEventListener("click", () => {
        const tabName = button.dataset.tab;
>>>>>>> 302316b70a4ec608aef88602193690127fa1afc4

  runBtn.addEventListener("click", async () => {
    const codeInput = document.getElementById("code");
    const inputInput = document.getElementById("input");

    const code = codeInput ? codeInput.value.trim() : "";
    const input = inputInput ? inputInput.value.trim() : "";

    const outputEl = document.getElementById("output");

<<<<<<< HEAD
    // Reset UI
    if (outputEl) {
      outputEl.style.color = "#ccc";
      outputEl.textContent = "Running...";
=======
function formatData(data) {
    if (!data) return null;
    if (typeof data === "object") {
        return JSON.stringify(data, null, 2);
    }
    return data;
}

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
        .trim(); 
}

function formatTokensWithLineNumbers(tokensData) {
    if (!tokensData) return "No token information.";

    let tokenArray = tokensData;
    
    if (!Array.isArray(tokensData) && typeof tokensData === 'object') {
        tokenArray = tokensData.tokens || [];
>>>>>>> 302316b70a4ec608aef88602193690127fa1afc4
    }

    // Validation Check
    if (!code) {
      if (outputEl) {
        outputEl.style.color = "#ff6b6b";
        outputEl.textContent = "⚠️ Please enter some code.";
      }
      return;
    }

<<<<<<< HEAD
=======
    return tokenArray.map(token => {
        let line = token.line || 1;
        let type = token.type || token.tokenType || "TOKEN";
        let value = token.value || token.lexeme || token.text || "";
        return `Line ${line}: ${type} -> ${value}`;
    }).join('\n');
}

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

>>>>>>> 302316b70a4ec608aef88602193690127fa1afc4
    try {
      const response = await fetch("http://127.0.0.1:5000/api/java/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, input }),
      });

      const data = await response.json();
      console.log("Backend Response:", data);

<<<<<<< HEAD
      // ── COMPILATION STATUS / EXECUTION OUTPUT ──────────────────────────
      if (outputEl) {
        if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          // Show errors clearly
          outputEl.style.color = "#ff6b6b";
          outputEl.textContent =
            "❌ Errors:\n" +
            data.errors
              .map((e) => {
                if (typeof e === "string") return `• ${e}`;
                const line = e.line ?? "?";
                const col = e.column ?? "?";
                const msg = e.message || e.msg || JSON.stringify(e);
                return ` Line ${line}, Col ${col}: ${msg}`;
              })
              .join("\n");
        } else if (data.output !== undefined && data.output !== null) {
          // Show actual execution output (from TAC interpreter)
          outputEl.style.color = "#a8ff78";
          outputEl.textContent = "> Output:\n" + (data.output || "(no output)");
=======
        if (result.targetCode) {
            tacOutput.innerText = cleanAssemblyCode(formatData(result.targetCode));
        } else if (result.output) {
            tacOutput.innerText = cleanAssemblyCode(formatData(result.output));
>>>>>>> 302316b70a4ec608aef88602193690127fa1afc4
        } else {
          // Fallback — show whatever the backend returned
          outputEl.style.color = "#ccc";
          outputEl.textContent = JSON.stringify(data, null, 2);
        }
      }

<<<<<<< HEAD
    } catch (err) {
      console.error("Fetch Error:", err);
      if (outputEl) {
        outputEl.style.color = "#ff6b6b";
        outputEl.textContent = "❌ Network/Server Error:\n" + err.message;
      }
    }
  });
});
=======
        if (result.tokens) {
            tokensOutput.innerText = formatTokensWithLineNumbers(result.tokens);
        } else {
            tokensOutput.innerText = "No token information.";
        }

        if (result.ast) {
            astOutput.innerText = formatData(result.ast);
        } else {
            astOutput.innerText = "No AST generated.";
        }

        if (result.symbolTable) {
            symbolTab.innerHTML = renderSymbolTable(result.symbolTable);
        } else {
            symbolTab.innerHTML = "<pre>No symbol table.</pre>";
        }

        if (result.semanticErrors) {
            semanticOutput.innerText = result.semanticErrors.length === 0 
                ? "No semantic errors." 
                : formatData(result.semanticErrors);
        } else {
            semanticOutput.innerText = "No semantic information.";
        }

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
>>>>>>> 302316b70a4ec608aef88602193690127fa1afc4
