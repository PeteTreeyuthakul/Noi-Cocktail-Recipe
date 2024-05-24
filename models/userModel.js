const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  password: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  roles: { type: [String], default: 'user' },
});

module.exports = mongoose.model("users", userSchema);
