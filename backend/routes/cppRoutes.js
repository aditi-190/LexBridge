const express = require("express");
const router = express.Router();

const { compileCpp } = require("../cpp_hub/compileCpp");

router.post("/compile", (req, res) => {

    const code = req.body.code || "";
    const input = req.body.input || "";

    const result = compileCpp(code, input);

    res.json(result);

});

module.exports = router;