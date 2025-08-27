"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bug, Mail, LogOut } from "lucide-react";

const LANGUAGES = [
  { label: "JavaScript", value: "javascript" },
  { label: "Python", value: "python" },
  { label: "C++", value: "cpp" },
  { label: "Java", value: "java" },
  { label: "Go", value: "go" },
];

const DIFFICULTIES = [
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
];

const xpMap = { easy: 50, medium: 75, hard: 100 };
const BUG_COUNT = 12;

const getRandomPosition = () => {
  const EDGE_SIZE_PERCENT = 15;
  const onVerticalEdge = Math.random() > 0.5;
  if (onVerticalEdge) {
    const x =
      Math.random() > 0.5
        ? Math.random() * EDGE_SIZE_PERCENT
        : 100 - Math.random() * EDGE_SIZE_PERCENT;
    const y = Math.random() * 100;
    return { x, y };
  } else {
    const y =
      Math.random() > 0.5
        ? Math.random() * EDGE_SIZE_PERCENT
        : 100 - Math.random() * EDGE_SIZE_PERCENT;
    const x = Math.random() * 100;
    return { x, y };
  }
};

function FloatingBug() {
  const [pos, setPos] = useState(getRandomPosition);
  useEffect(() => {
    const interval = setInterval(() => {
      setPos(getRandomPosition());
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);
  return (
    <Bug
      className="absolute animate-pulse"
      size={Math.random() > 0.5 ? 24 : 28}
      style={{
        top: `${pos.y}%`,
        left: `${pos.x}%`,
        transition: "all 2.5s cubic-bezier(0.4, 0, 0.2, 1)",
        pointerEvents: "none",
        zIndex: 20,
        color: Math.random() > 0.5 ? "#ff0080" : "#8000ff",
        filter: `drop-shadow(0 0 8px ${
          Math.random() > 0.5 ? "#ff0080" : "#8000ff"
        }) brightness(1.2)`,
      }}
      aria-label="floating bug icon"
    />
  );
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [huntOpen, setHuntOpen] = useState(false);
  const [language, setLanguage] = useState(LANGUAGES[0].value);
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[0].value);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      fetch("http://localhost:5000/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch profile");
          return res.json();
        })
        .then((data) => setUser(data.user))
        .catch(() => {
          localStorage.removeItem("token");
          router.push("/login");
        });
    }
  }, [router]);

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
          <p className="text-2xl text-purple-400 font-bold animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    );

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const startBugHunt = () => setHuntOpen(true);

  const handleChallengeStart = (e) => {
    e.preventDefault();
    router.push(`/challenges?language=${language}&difficulty=${difficulty}`);
  };

  return (
    <div className="min-h-screen w-full flex flex-col">
      <div
        className="flex-1 flex items-center justify-center relative"
        style={{
          background:
            "radial-gradient(circle at 20% 50%, #1a0033 0%, #000000 25%, #0d0d0d 50%, #000000 100%)",
          backgroundSize: "200% 200%",
          animation: "gradientShift 8s ease infinite",
        }}
      >
        <style jsx>{`
          @keyframes gradientShift {
            0%,
            100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }
          .glass-morphism {
            background: rgba(15, 15, 15, 0.7);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .glow-text {
            text-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
          }
          .neon-border {
            border: 2px solid transparent;
            background: linear-gradient(45deg, #ff0080, #8000ff, #00ff80)
              border-box;
            border-radius: 16px;
          }
        `}</style>

        <div className="w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-2 gap-12 px-8 py-12 relative">
          <button
            onClick={handleLogout}
            className="absolute top-4 right-1 z-20 flex items-center gap-2 px-4 py-2 rounded-xl glass-morphism border border-red-500/30 text-red-400 hover:text-red-300 hover:border-red-400/50 transition-all duration-300 hover:scale-105 group"
            style={{
              background: "rgba(20, 5, 5, 0.8)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 0 15px rgba(239, 68, 68, 0.2)",
            }}
          >
            <LogOut
              size={18}
              className="group-hover:animate-pulse"
              style={{
                filter: "drop-shadow(0 0 6px #ef4444)",
              }}
            />
            <span className="font-semibold text-sm uppercase tracking-wider">
              Logout
            </span>
          </button>
          <div className="flex flex-col gap-10 items-center z-10">
            <div className="text-center space-y-6">
              <div className="text-6xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 glow-text">
                BUG HUNTER
              </div>
              <div className="glass-morphism rounded-2xl px-8 py-4 shadow-2xl">
                <p className="text-gray-300 text-sm font-mono uppercase tracking-[0.3em] mb-2">
                  Welcome back
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-white glow-text">
                  {user.username || user.name || "Hunter"}
                </h2>
              </div>
            </div>

            <div className="w-full glass-morphism rounded-2xl p-8 text-center shadow-2xl border-2 border-purple-500/20">
              <div className="text-sm uppercase text-purple-300 tracking-[0.2em] mb-3 font-semibold">
                Total Experience Points
              </div>
              <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 glow-text">
                {(user.XP ?? 0).toLocaleString()}
              </div>
              <div className="mt-4 w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min(((user.XP ?? 0) % 1000) / 10, 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 w-full">
              <div className="glass-morphism rounded-2xl p-6 text-center shadow-xl border border-pink-500/20">
                <div className="text-xs uppercase text-pink-300 tracking-widest mb-2 font-semibold">
                  Last Active
                </div>
                <div className="text-lg text-white font-bold">
                  {user.lastActiveDate
                    ? new Date(user.lastActiveDate).toDateString() ===
                      new Date().toDateString()
                      ? "Today"
                      : new Date(user.lastActiveDate).toLocaleDateString()
                    : "Today"}
                </div>
              </div>
              <div className="glass-morphism rounded-2xl p-6 text-center shadow-xl border border-orange-500/20">
                <div className="text-xs uppercase text-orange-300 tracking-widest mb-2 font-semibold">
                  Streak
                </div>
                <div className="text-lg text-white font-bold flex items-center justify-center gap-2">
                  {user.streak || 0}
                  <span className="text-2xl">🔥</span>
                </div>
              </div>
            </div>

            <div className="w-full space-y-6">
              {!huntOpen ? (
                <button
                  className="group relative w-full py-6 px-8 rounded-2xl font-black text-xl uppercase tracking-wider text-white overflow-hidden transition-all duration-300 hover:scale-105 focus:outline-none"
                  style={{
                    background:
                      "linear-gradient(45deg, #ff0080, #8000ff, #00ff80)",
                    backgroundSize: "300% 300%",
                    animation: "gradientShift 3s ease infinite",
                    boxShadow:
                      "0 0 30px rgba(255, 0, 128, 0.5), 0 0 60px rgba(128, 0, 255, 0.3)",
                  }}
                  onClick={startBugHunt}
                >
                  <div className="flex items-center justify-center gap-4">
                    <Bug className="w-10 h-10 group-hover:animate-bounce" />
                    START BUG HUNT
                  </div>
                </button>
              ) : (
                <form
                  className="space-y-6 animate-[fadeIn_0.5s_ease-in-out]"
                  onSubmit={handleChallengeStart}
                >
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-gray-300 font-semibold mb-2 block">
                        Coding Language:
                      </span>
                      <select
                        className="w-full py-3 px-4 rounded-xl bg-black/60 text-purple-300 font-semibold border border-purple-500/30 focus:outline-none focus:border-purple-400 backdrop-blur-sm transition-all"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                      >
                        {LANGUAGES.map((lang) => (
                          <option
                            key={lang.value}
                            value={lang.value}
                            className="bg-black"
                          >
                            {lang.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-gray-300 font-semibold mb-2 block">
                        Difficulty:
                      </span>
                      <select
                        className="w-full py-3 px-4 rounded-xl bg-black/60 text-purple-300 font-semibold border border-purple-500/30 focus:outline-none focus:border-purple-400 backdrop-blur-sm transition-all"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                      >
                        {DIFFICULTIES.map((diff) => (
                          <option
                            key={diff.value}
                            value={diff.value}
                            className="bg-black"
                          >
                            {diff.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg">
                      +{xpMap[difficulty?.toLowerCase()] || 0} XP
                    </span>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 px-8 rounded-xl font-black text-lg uppercase tracking-wider text-white transition-all duration-300 hover:scale-105 focus:outline-none"
                    style={{
                      background: "linear-gradient(45deg, #ff0080, #8000ff)",
                      boxShadow: "0 0 25px rgba(255, 0, 128, 0.4)",
                    }}
                  >
                    HUNT NOW
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="relative flex items-center justify-center glass-morphism rounded-3xl p-8 min-h-[600px] overflow-hidden border-2 border-purple-500/20 shadow-2xl">
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src="/Anti-Tamper.png"
                alt="Anti-Tamper"
                className="w-full max-w-md h-auto object-contain rounded-2xl select-none shadow-2xl transition-all duration-500 hover:scale-105"
                style={{
                  filter: "drop-shadow(0 0 50px rgba(128, 0, 255, 0.6))",
                }}
                draggable={false}
              />

              {[...Array(BUG_COUNT)].map((_, i) => (
                <FloatingBug key={i} />
              ))}

              <div className="absolute inset-0 rounded-3xl pointer-events-none">
                <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-60 animate-pulse"></div>
                <div className="absolute bottom-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-60 animate-pulse"></div>
                <div className="absolute left-0 top-1/4 h-1/2 w-1 bg-gradient-to-b from-transparent via-purple-500 to-transparent opacity-60 animate-pulse"></div>
                <div className="absolute right-0 top-1/4 h-1/2 w-1 bg-gradient-to-b from-transparent via-pink-500 to-transparent opacity-60 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-purple-900/5 to-transparent rounded-full blur-3xl"></div>
        </div>
      </div>

      <footer
        className="relative z-10 glass-morphism border-t border-purple-500/20"
        style={{
          background: "rgba(10, 10, 10, 0.9)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Bug
                className="text-purple-400 animate-pulse"
                size={28}
                style={{
                  filter: "drop-shadow(0 0 10px #8000ff)",
                }}
              />
              <div className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-black text-xl tracking-wide">
                BUG HUNTER
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-300">
              <Mail
                className="text-purple-400"
                size={20}
                style={{
                  filter: "drop-shadow(0 0 8px #8000ff)",
                }}
              />
              <span className="text-sm font-medium">Contact me at:</span>
              <a
                href="mailto:siddhant9696gupta761@gmail.com"
                className="text-purple-300 hover:text-purple-200 font-semibold transition-colors duration-300 hover:glow-text"
                style={{
                  textShadow: "0 0 10px rgba(167, 139, 250, 0.5)",
                }}
              >
                siddhant9696gupta761@gmail.com
              </a>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-700/50 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Bug Hunter. Hunt bugs, level up, become legendary.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
