const express = require("express");
const router = express.Router();

const cppController = require("../controllers/cppController");

router.post("/run", cppController.run);

module.exports = router;