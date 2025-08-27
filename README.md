# Bug Hunter - Coding Bug Bounty Platform

Bug Hunter is an interactive coding platform that gamifies debugging challenges by allowing users to find and fix bugs in code snippets. Users earn XP and maintain activity streaks as motivation.

---

## Features

- Dynamic buggy code challenges generated based on selected programming language and difficulty.
- User authentication with JWT-based secure login.
- Live code execution and output display.
- Automated code correctness validation.
- XP reward system with streak tracking.
- Animated bug-themed UI with engaging gamification elements.
- Seamless navigation between challenges and dashboard.

---

## Tech Stack

- **Frontend:** React (Next.js, client components), Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express.js, MongoDB with Mongoose
- **Authentication:** JSON Web Tokens (JWT)
- **Code Execution:** Secure server-side code runner for evaluating submissions

---

## Setup Instructions

### Prerequisites

- Node.js v16+
- MongoDB running locally or cloud instance

### Backend

1. Clone the repository:
2. Install dependencies:
3. Create `.env` file 

### Frontend

1. Change directory and install:
2. Run frontend server:
3. Open `http://localhost:3000` in your browser.

---

## API Endpoints Summary

| Endpoint | Method | Description |
|---------|--------|-------------|
| `/api/auth/login` | POST | Login and obtain JWT token |
| `/api/profile` | GET | Get current user details |
| `/api/challenges/generate` | GET | Get new buggy challenge |
| `/api/code/run` | POST | Run user code and get output |
| `/api/valid` | POST | Validate user submission correctness |
| `/api/users/add-xp` | POST | Add XP points to user |
| `/api/users/update-p-streak` | POST | Add XP and update user's streak |

---

## Usage

- Choose language and difficulty.
- Analyze the buggy code and write fixed code.
- Run code to test output.
- Submit code for validation.
- Earn XP and build your streak!
- Use the dashboard to track progress and navigate challenges.

---

## Contributing

Contributions, issues and feature requests are welcome! Feel free to check the issues page and fork the repository.

---

## Contact

For inquiries or feedback, please reach out to your.email@example.com

---

Happy bug hunting 🚀🐞

