const History = require("../models/History");

const saveHistory = async (req, res) => {
const { inputText, outputText, sourceLanguage, targetLanguage } = req.body;

    const history = new History({
        inputText,
        outputText,
        sourceLanguage,
        targetLanguage
    });

    await history.save();

    res.status(201).json({
        message: "History saved successfully",
        history
    });
};
const getHistory = async (req, res) => {
    const histories = await History.find();

    res.json(histories);
};
const deleteHistory = async (req, res) => {
    const id = req.params.id;

    await History.findByIdAndDelete(id);

    res.json({
        message: "History deleted successfully"
    });
};
module.exports = {
    saveHistory,
    getHistory,
    deleteHistory
};