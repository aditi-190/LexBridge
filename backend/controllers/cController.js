const { runCompiler } = require("../services/compilerC");

function compile(req, res) {

    try {

        const { code } = req.body;

        if (!code) {

            return res.status(400).json({

                success: false,

                message: "Source code is required."

            });

        }

        const result = runCompiler(code);

        res.json(result);

    }

    catch (err) {

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

}

module.exports = {

    compile

};