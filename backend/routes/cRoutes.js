const express = require("express");

const router = express.Router();

const {
    compileC
} = require("../c_hub/compileC");


// ==========================================
// POST /api/c/compile
// ==========================================

router.post("/compile", (req, res) => {

    try {

        const code =
            typeof req.body.code === "string"
                ? req.body.code
                : "";

        const input =
            typeof req.body.input === "string"
                ? req.body.input
                : "";


        // Empty code

        if (!code.trim()) {

            return res.status(400).json({

                success: false,

                phase: "Input",

                errors: [
                    {
                        message:
                            "No C code was provided."
                    }
                ]

            });

        }


        console.log(
            "\n===== C COMPILER REQUEST ====="
        );

        console.log(
            "Input length:",
            input.length
        );


        // ==================================
        // RUN COMPILER
        // ==================================
const result =
    compileC(
        code,
        input
    );


        // ==================================
        // SEND RESULT
        // ==================================

        return res.json(result);

    }

    catch (error) {

        console.error(
            "\n===== C COMPILER API ERROR ====="
        );

        console.error(error);


        return res.status(500).json({

            success: false,

            phase: "Backend",

            error:
                error.message ||
                "Internal server error."

        });

    }

});


module.exports = router;