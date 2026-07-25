const express = require("express");
const router = express.Router();
const {
    saveHistory,
    getHistory,
    deleteHistory
} = require("../controllers/historyController");
router.post("/", saveHistory);
router.get("/", getHistory);
router.delete("/:id", deleteHistory);
module.exports = router;