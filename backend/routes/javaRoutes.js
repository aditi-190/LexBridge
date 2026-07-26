const express = require("express");
const router = express.Router();

const { compileCode } = require("../controllers/javaController");

router.post("/compile", compileCode);

module.exports = router;