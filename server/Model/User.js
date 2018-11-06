const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema({
  id: { type: String, required: true },
  email: { type: String },
  name: { type: String, required: false },
  password: { type: String, required: false },
  publicAddress: { type: String, required: true },
  nonce: { type: Number, required: true, default: Math.floor(Math.random() * 1000000) },
});

User.path("publicAddress").get((value) => {
  return value.toLowerCase();
})

const user = mongoose.model('user', User);

module.exports = user;
