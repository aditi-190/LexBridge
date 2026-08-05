const express = require("express");
const router = express.Router();
const pythonController = require("../controllers/pythonController");

// POST /api/python/compile
router.post("/compile", pythonController.compilePythonCode);

module.exports = router;