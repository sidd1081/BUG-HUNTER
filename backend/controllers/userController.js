const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt=require("jsonwebtoken")

const getUsers=(req,res)=>{
res.json("List of users")
}



const registerUser=async(req,res)=>{
    try{
    const { name, email, password } = req.body;
   if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const existingUser=await User.findOne({email});
  if(existingUser){
    return res.status(400).json({ message: "User already exists" });
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user= await User.create({name,email,password:hashedPassword});
  res.status(201).json({
    name: user.name,
    email: user.email,
    message: "User registered successfully",
});
  }
catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ message: 'Server Error' });
};
}



const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2. Check if user exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 4. Generate JWT token
    const token = jwt.sign(
      { id: existingUser._id, email: existingUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 5. Send success response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        name: existingUser.name,
        email: existingUser.email
      }
    });

  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


// Add XP to user account


// Add XP to user account

const addXP = async (req, res) => {
  try {
    const { xp } = req.body;
    const userId = req.user?._id || req.userId; // user set in middleware

    if (!xp || xp <= 0) {
      return res.status(400).json({ message: "Invalid XP amount" });
    }
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: no user ID" });
    }

    // Increment XP
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { XP: xp } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      success: true,
      message: `${xp} XP added successfully`,
      newXP: user.XP,
    });
  } catch (error) {
    console.error("Error adding XP:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


const updateStreakAndXP = async (req, res) => {
  try {
    const { xp } = req.body;
    const userId = req.user?._id || req.userId;

    if (!xp || xp <= 0) {
      return res.status(400).json({ message: "Invalid XP amount" });
    }
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: no user ID" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let lastActive = user.lastActiveDate;
    if (lastActive) {
      lastActive = new Date(lastActive);
      lastActive.setHours(0, 0, 0, 0);
    }

    let streak = user.streak || 0;

    if (lastActive) {
      const diff = Math.floor(
        (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diff === 1) {
        // consecutive day
        streak += 1;
      } else if (diff > 1) {
        // streak broken
        streak = 1;
      }
      // If diff === 0 means already updated today, don't change streak
    } else {
      streak = 1; // first time user is active
    }

    user.XP = (user.XP || 0) + xp;
    user.streak = streak;
    user.lastActiveDate = today;

    await user.save();

    return res.json({
      success: true,
      message: `Added ${xp} XP! Current streak: ${streak} days.`,
      newXP: user.XP,
      newStreak: streak,
    });
  } catch (error) {
    console.error("Error updating streak and XP:", error);
    return res.status(500).json({ message: "Server error" });
  }
};








module.exports = {
  getUsers,
  registerUser,
  loginUser,
  addXP,
  updateStreakAndXP
};
