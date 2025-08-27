const express = require("express");
const router = express.Router();
const {
  getUsers,
  registerUser,
  loginUser,
  addXP,
  updateStreakAndXP,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");


router.get("/",getUsers)

router.post("/register",registerUser);

router.post("/login", loginUser);

router.post("/add-xp",protect, updateStreakAndXP);



module.exports = router;