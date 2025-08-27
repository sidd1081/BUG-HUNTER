const express = require("express");
const router = express.Router();
const validationController = require("../services/codevalidator");

// POST /api/challenges/validate
router.post("/validate", validationController.validateUserSolution);

router.get("/test", (req, res) => {
  res.send("Validation routes working");
});

module.exports = router;
