// controllers/codeRunnerController.js

const fetch = require("node-fetch");
const dotenv = require("dotenv");
dotenv.config();
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const JUDGE0_URL =
  "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true";

const langMap = {
  javascript: 63,
  python: 71,
  cpp: 54,
  java: 62,
  go: 60,
};

exports.runCode = async (req, res) => {
  const { code, language } = req.body;

  if (!code || !language || !langMap[language]) {
    return res.status(400).json({ error: "Invalid code or language" });
  }

  try {
    const response = await fetch(JUDGE0_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": "ba8e255f33msh4290cdc4afe3a93p144967jsn2738c444b9ba",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
      body: JSON.stringify({
        source_code: code,
        language_id: langMap[language],
        stdin: "", // include this
        redirect_stderr_to_stdout: true, // good for debugging
      }),
    });

    const data = await response.json();
    console.log("Judge0 full response:", data); // Log all to check

    const output = data.stdout || data.compile_output || data.stderr || "";

    res.json({ output, type: "success" });
  } catch (e) {
    res.status(500).json({ error: "Judge0 API error", details: e.message });
  }
};
