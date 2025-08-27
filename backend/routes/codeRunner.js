// routes/codeRunner.js
const express = require("express");
const router = express.Router();
const codeRunner = require("../controllers/codeRunner");

// POST /api/code/run
router.post("/run", codeRunner.runCode);

module.exports = router;
