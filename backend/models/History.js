const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    inputText: {
      type: String,
      required: true,
    },

    outputText: {
      type: String,
      required: true,
    },

    sourceLanguage: {
      type: String,
      required: true,
    },

    targetLanguage: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("History", historySchema);