document.addEventListener("DOMContentLoaded", () => {
  const runBtn = document.getElementById("runBtn");
  const outputEl = document.getElementById("output");
  const statusBadge = document.querySelector(".status-badge");
  const languageSelect = document.getElementById("languageSelect");
  const codeInput = document.getElementById("code");
  const fileTag = document.querySelector(".file-tag");

  const languageConfig = {
    java: {
      endpoint: "http://127.0.0.1:5000/api/java/compile",
      fileExtension: "Main.java",
      placeholder: `class Main {\n\n    public static void main(String[] args) {\n\n        System.out.println("Hello World");\n\n    }\n\n}`
    },
    c: {
      endpoint: "http://127.0.0.1:5000/api/c/compile",
      fileExtension: "main.c",
      placeholder: `#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}`
    },
    cpp: {
      endpoint: "http://127.0.0.1:5000/api/cpp/compile",
      fileExtension: "main.cpp",
      placeholder: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello World" << endl;\n    return 0;\n}`
    },
    python: {
      endpoint: "http://127.0.0.1:5000/api/python/compile",
      fileExtension: "main.py",
      placeholder: `print("Hello World")`
    }
  };
  const setLanguage = (langKey) => {
    const config = languageConfig[langKey];
    if (!config) return;

    if (fileTag) fileTag.textContent = config.fileExtension;
    if (codeInput) {
      codeInput.value = ""; 
      codeInput.placeholder = config.placeholder; 
    }
  };

  const initialLang = languageSelect ? languageSelect.value : "java";
  setLanguage(initialLang);

  if (languageSelect) {
    languageSelect.addEventListener("change", (e) => {
      setLanguage(e.target.value);
    });
  }
  const updateStatus = (text, type) => {
    if (!statusBadge) return;
    statusBadge.textContent = text;
    statusBadge.className = `status-badge ${type}`;
  };

  if (!runBtn) return;

  runBtn.addEventListener("click", async () => {
    const selectedLang = languageSelect ? languageSelect.value : "java";
    const currentConfig = languageConfig[selectedLang];

    const inputInput = document.getElementById("input");
    const code = codeInput ? codeInput.value.trim() : "";
    const input = inputInput ? inputInput.value.trim() : "";

  
    if (outputEl) {
      outputEl.style.color = "#94a3b8";
      outputEl.textContent = "Running code...";
    }
    updateStatus("Running", "running");
    runBtn.disabled = true;

    if (!code) {
      if (outputEl) {
        outputEl.style.color = "#f87171";
        outputEl.textContent = "⚠️ Please enter some code to execute.";
      }
      updateStatus("Error", "error");
      runBtn.disabled = false;
      return;
    }

    try {
      const response = await fetch(currentConfig.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, input }),
      });

      const data = await response.json();
      console.log("Backend Response:", data);

      if (outputEl) {
        if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          outputEl.style.color = "#f87171";
          const formattedErrors = data.errors
            .map((e) => {
              if (typeof e === "string") return e;
              const line = e.line ?? "?";
              const col = e.column ?? "?";
              const msg = e.message || e.msg || JSON.stringify(e);
              return `Line ${line}, Col ${col}: ${msg}`;
            })
            .join("\n");

          outputEl.textContent = `✖ Errors:\n${formattedErrors}`;
          updateStatus("Error", "error");
        } 
        else if (data.output !== undefined && data.output !== null) {
          outputEl.style.color = "#f8fafc";
          outputEl.textContent = data.output || "Program executed with no output.";
          updateStatus("Ready", "idle");
        } 
        else {
          outputEl.style.color = "#cbd5e1";
          outputEl.textContent = JSON.stringify(data, null, 2);
          updateStatus("Ready", "idle");
        }
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      if (outputEl) {
        outputEl.style.color = "#f87171";
        outputEl.textContent = "✖ Network/Server Error:\n" + err.message;
      }
      updateStatus("Error", "error");
    } finally {
      runBtn.disabled = false;
    }
  });
});