const express = require("express");
const router = express.Router();

const {
    runCppCode
} = require("../controllers/cppController");

router.post("/run", runCppCode);

module.exports = router;