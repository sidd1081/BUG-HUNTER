const express=require("express");
const router=express.Router();
const {protect} = require("../middleware/auth")

router.get("/", protect, (req, res) => {
  res.json({
    message: "User profile fetched successfully",
    user: req.user, // protect middleware se aaya
  });
});

module.exports = router;