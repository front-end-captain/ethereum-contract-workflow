const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
  username: String,
  password: String,
  email: String,
  phone: String,
  superAdmin: Boolean,
});

const Admin = mongoose.model("admin", AdminSchema);

module.exports = Admin;
