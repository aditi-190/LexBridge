const compileCpp = require("../services/compilerCpp");

const runCppCode = async (req, res) => {

    try {

        console.log("========== API CALLED ==========");

        console.log("Request Body:", req.body);

        const { code, input } = req.body;

        const result = await compileCpp(code, input);

        console.log("Compiler Result:", result);

        res.json(result);

    }

    catch (err) {

        console.log("Controller Error:", err);

        res.status(500).json({

            success: false,

            output: err.message

        });

    }

};

module.exports = { runCppCode };