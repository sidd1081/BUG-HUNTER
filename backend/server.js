const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db")
const cors = require("cors");
const codeRunner= require("../backend/routes/codeRunner")
const challenges=require("../backend/routes/challenges")
const profileRoutes = require("./routes/profileRoutes")
const validationRoutes = require("./routes/validation");

const userRoutes = require("./routes/userRoutes");
dotenv.config();
connectDB();



const app=express();
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "bug-hunter-five.vercel.app",
      "https://bug-hunter-jrcs.onrender.com",
    ],
    credentials: true,
  })
);

app.get('/api/ping', (req, res) => {
  res.send('pong');
});

app.use("/api/users", userRoutes);
app.use("/api/profile",profileRoutes);
app.use("/api/challenges", challenges)
app.use("/api/code", codeRunner);
app.use("/api/valid", validationRoutes);
 
const PORT=process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Server running on port 5000');
});