const mongoose = require("mongoose");
const Challenge = require("./models/Challenge");
require("dotenv").config();

const challenges = [
  {
    language: "JavaScript",
    difficulty: "Easy",
    buggyCode: "function sum(a, b) { return a - b; }",
    description: "Fix the bug in sum function",
    expectedFix: "return a + b;",
  },
  
];

const seedDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Challenge.deleteMany({});
  await Challenge.insertMany(challenges);
  console.log("Challenges seeded");
  mongoose.disconnect();
};

seedDB();
