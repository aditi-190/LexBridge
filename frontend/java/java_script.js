document.addEventListener("DOMContentLoaded", () => {
  const runBtn = document.getElementById("runBtn");

  if (!runBtn) return;

  runBtn.addEventListener("click", async () => {
    const codeInput = document.getElementById("code");
    const inputInput = document.getElementById("input");

    const code = codeInput ? codeInput.value.trim() : "";
    const input = inputInput ? inputInput.value.trim() : "";

    const outputEl = document.getElementById("output");

    // Reset UI
    if (outputEl) {
      outputEl.style.color = "#ccc";
      outputEl.textContent = "Running...";
    }

    // Validation Check
    if (!code) {
      if (outputEl) {
        outputEl.style.color = "#ff6b6b";
        outputEl.textContent = "⚠️ Please enter some code.";
      }
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/api/java/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, input }),
      });

      const data = await response.json();
      console.log("Backend Response:", data);

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
        } else {
          // Fallback — show whatever the backend returned
          outputEl.style.color = "#ccc";
          outputEl.textContent = JSON.stringify(data, null, 2);
        }
      }

    } catch (err) {
      console.error("Fetch Error:", err);
      if (outputEl) {
        outputEl.style.color = "#ff6b6b";
        outputEl.textContent = "❌ Network/Server Error:\n" + err.message;
      }
    }
  });
});