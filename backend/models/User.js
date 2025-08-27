const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: "" },
  streak: { type: Number, default: 0 },
  XP: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now },
  solvedChallenges: [String], // challenge IDs store karne ke liye
  lastActiveDate: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
