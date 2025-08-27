const express = require("express");
const  generateBuggyChallenge = require ("../services/openai");
const { protect } = require("../middleware/auth");

const router = express.Router();

// GET AI challenge
router.get("/generate", async (req, res) => {
  try {
    const { language, difficulty } = req.query;
    const challenge = await generateBuggyChallenge(
      language || "javascript",
      difficulty || "easy"
    );
    res.json(challenge);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating challenge" });
  }
});

module.exports = router;
