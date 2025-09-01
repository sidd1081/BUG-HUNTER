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

const allowedOrigins = [
  "http://localhost:3000",
  "https://bug-hunter-liard.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
