const OpenAI = require("openai");

const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY,
});

exports.validateUserSolution = async (req, res) => {
  const { problemDescription, userCode, language } = req.body;

  if (!problemDescription || !userCode || !language) {
    return res
      .status(400)
      .json({ success: false, message: "Missing parameters." });
  }

  try {
    const prompt = `
You are a code review assistant.

Problem description:
${problemDescription}

User fixed code in ${language}:
${userCode}

Check if the user's code fixes the bug described above.
If it's correct, reply only with: "Correct".

If not, reply with a brief explanation of the mistakes or what needs to be fixed.
`;

    const response = await openai.chat.completions.create({
      model: "deepseek/deepseek-r1:free",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    const aiMessage = response.choices[0].message.content.trim();

    const success = aiMessage.toLowerCase().startsWith("correct");

    res.json({ success, message: aiMessage });
  } catch (error) {
    console.error(
      "OpenAI API error:",
      error.response?.data || error.message || error
    );
    res.status(500).json({ success: false, message: "AI validation failed." });
  }

};
