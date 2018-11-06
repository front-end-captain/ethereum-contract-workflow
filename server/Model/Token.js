const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema({
  id: { type: String, required: true },
  token: { type: String, required: true },
});

const token = mongoose.model("token", TokenSchema);

module.exports = token;
