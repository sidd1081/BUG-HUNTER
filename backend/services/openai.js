const OpenAI = require("openai");
const dotenv = require("dotenv");
dotenv.config();

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY,
});

const generateBuggyChallenge = async (
  language = "javascript",
  difficulty = "easy"
) => {
  const prompt = `
  Generate a coding challenge with buggy code as fast as possible.
  Requirements:
  - Language: ${language}
  - Difficulty: ${difficulty}
  - Provide buggy code snippet
  - Mention the challenge description
  - DO NOT give the fixed solution, only buggy code.
  - Give Code with proper structuring.
  - Also Give Main Function for Proper Running of Code.
  - ALso Give some valid test cases.
  - Format response as JSON with fields: { "title": "", "description": "","language":"","difficulty":"", "buggyCode": "" }
  `;

  try {
    const response = await client.chat.completions.create({
      model: "deepseek/deepseek-r1:free",
      messages: [{ role: "user", content: prompt }],
    });

    let text = response.choices[0].message.content;
    text = text.replace(/```json|```/g, "").trim();

    return JSON.parse(text);
  } catch (err) {
    console.error("Failed to generate or parse AI response:", err);
    return null;
  }
};

module.exports = generateBuggyChallenge;
