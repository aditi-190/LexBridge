const express = require("express");

const router = express.Router();

const { compile } = require("../controllers/cController");

router.post("/compile", compile);

module.exports = router;