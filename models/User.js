const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  googleCalendarToken: { type: String, default: null }, // Access token
  googleRefreshToken: { type: String, default: null }, // Refresh token
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = User;