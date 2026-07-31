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

    if(sourceCode.trim()===""){

        output.innerText="Please write C++ code first.";

        return;

    }

    output.innerText="Running Program...";

    try{

       console.log("Source Code:", sourceCode);
console.log("Program Input:", programInput);
console.log("Run button clicked");
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
        if(!response.ok){
    throw new Error("Server Error");
}


console.log("Response Status:", response.status);


    }

   catch(error){

    console.error("Frontend Error:", error);

    output.innerText = error.message;



    const result = await response.json();

console.log("Backend Response:", result);

output.textContent = result.output;
}
});


// =========================
// SAVE BUTTON
// =========================

saveBtn.addEventListener("click",()=>{

    const blob=new Blob(

        [code.value],

        {

            type:"text/plain"

        }

    );

    const link=document.createElement("a");

    link.href=URL.createObjectURL(blob);

    link.download="program.cpp";

    link.click();

});


// =========================
// SHARE BUTTON
// =========================

shareBtn.addEventListener("click",()=>{

    navigator.clipboard.writeText(code.value);

    alert("Code copied to clipboard.");

});