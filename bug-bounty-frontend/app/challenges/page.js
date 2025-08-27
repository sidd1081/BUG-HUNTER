"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Play, Shield, Bug, Trophy, Target, LogOut } from "lucide-react";

const xpMap = {
  easy: 50,
  medium: 75,
  hard: 100,
};

const FloatingBug = ({ delay = 0 }) => {
  return (
    <Bug
      className="absolute animate-pulse opacity-20"
      size={Math.random() * 16 + 12}
      style={{
        top: `${Math.random() * 80 + 10}%`,
        left: `${Math.random() * 80 + 10}%`,
        color: Math.random() > 0.5 ? "#ff0080" : "#8000ff",
        filter: `drop-shadow(0 0 6px ${
          Math.random() > 0.5 ? "#ff0080" : "#8000ff"
        })`,
        animationDelay: `${delay}s`,
        animationDuration: `${4 + Math.random() * 2}s`,
      }}
    />
  );
};

// Loading component for Suspense fallback
const LoadingChallenge = () => (
  <div
    className="min-h-screen flex items-center justify-center"
    style={{
      background:
        "radial-gradient(circle at 20% 50%, #1a0033 0%, #000000 25%, #0d0d0d 50%, #000000 100%)",
    }}
  >
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
      <p className="text-2xl text-purple-400 font-bold animate-pulse">
        Loading challenge...
      </p>
    </div>
  </div>
);

// Main challenge component that uses useSearchParams
function ChallengeContent() {
  const [challenge, setChallenge] = useState(null);
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);
  const [userCode, setUserCode] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [runningCode, setRunningCode] = useState(false);
  const [loadingNextChallenge, setLoadingNextChallenge] = useState(false);
  const debounceTimeoutRef = useRef(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const language = searchParams.get("language");
  const difficulty = searchParams.get("difficulty");

  const fetchChallenge = useCallback(async () => {
    if (!language || !difficulty) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/challenges/generate?language=${language}&difficulty=${difficulty}`
      );
      const data = await res.json();
      setChallenge(data);
      setUserCode(data.buggyCode || "");
      setOutput("");
      setSubmitResult(null);
    } catch (err) {
      console.error("Error fetching challenge:", err);
    }
  }, [language, difficulty]);

  useEffect(() => {
    fetchChallenge();
  }, [fetchChallenge]);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setUser(data.user);
      } catch (e) {
        console.error("Failed to fetch user", e);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(challenge.buggyCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runCodeActual = useCallback(async () => {
    if (!userCode) return;
    setRunningCode(true);
    setOutput("");
    try {
      const res = await fetch("http://localhost:5000/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: userCode, language }),
      });
      const data = await res.json();
      setOutput(data.output || "No output returned.");
    } catch {
      setOutput("Error running code.");
    }
    setRunningCode(false);
  }, [userCode, language]);

  const handleRun = useCallback(() => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    setLoading(true);
    debounceTimeoutRef.current = setTimeout(() => {
      setLoading(false);
      runCodeActual();
    }, 300);
  }, [runCodeActual]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, []);

  const handleNextChallenge = async () => {
    setLoadingNextChallenge(true);
    setShowSuccessPopup(false);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    await fetchChallenge();
    setLoadingNextChallenge(false);
  };

  const handleGoDashboard = () => {
    router.push("/dashboard");
  };

  const handleSubmit = async () => {
    if (!userCode) return;
    setLoading(true);
    setSubmitResult(null);

    try {
      const res = await fetch("http://localhost:5000/api/valid/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemDescription: challenge.description,
          userCode,
          language,
        }),
      });
      const data = await res.json();

      if (data.success) {
        const xpToAdd = xpMap[difficulty?.toLowerCase()] || 0;
        const token = localStorage.getItem("token");
        if (token && xpToAdd > 0) {
          try {
            const xpRes = await fetch(
              "http://localhost:5000/api/users/add-xp",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ xp: xpToAdd }),
              }
            );

            if (xpRes.ok) {
              const xpData = await xpRes.json();
              setUser((prev) => ({
                ...prev,
                XP: xpData.newXP,
                streak: xpData.newStreak,
              }));
            } else {
              console.warn("Failed to add XP on server");
              setUser((prev) => ({ ...prev, XP: (prev?.XP || 0) + xpToAdd }));
            }
          } catch (xpError) {
            console.error("Error updating XP:", xpError);
            setUser((prev) => ({ ...prev, XP: (prev?.XP || 0) + xpToAdd }));
          }
        }
        setShowSuccessPopup(true);
      } else {
        setSubmitResult(data);
      }
    } catch {
      setSubmitResult({ success: false, message: "Submission error." });
    }
    setLoading(false);
  };

  if (loadingNextChallenge) {
    return (
      <div
        className="min-h-screen flex items-center justify-center relative"
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
          @keyframes float {
            0%,
            100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }
        `}</style>

        <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <FloatingBug key={i} delay={i * 0.3} />
          ))}
        </div>

        <div className="text-center z-10">
          <div className="mb-8">
            <Bug
              size={80}
              className="text-purple-400 mx-auto animate-pulse"
              style={{
                filter: "drop-shadow(0 0 30px #8000ff)",
                animation: "float 3s ease-in-out infinite",
              }}
            />
          </div>

          <h2 className="text-4xl md:text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400">
            FINDING NEW BUGS...
          </h2>

          <div className="flex items-center justify-center gap-2 mb-6">
            <div
              className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-3 h-3 bg-pink-500 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>

          <p className="text-purple-300 text-lg font-mono uppercase tracking-[0.3em] animate-pulse">
            Preparing Next Mission
          </p>

          <div className="mt-8 w-64 mx-auto h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full"
              style={{
                width: "100%",
                animation: "loading 1.5s ease-in-out infinite",
              }}
            ></div>
          </div>
        </div>

        <style jsx>{`
          @keyframes loading {
            0% {
              transform: translateX(-100%);
            }
            50% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      </div>
    );
  }

  if (!challenge)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "radial-gradient(circle at 20% 50%, #1a0033 0%, #000000 25%, #0d0d0d 50%, #000000 100%)",
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
          <p className="text-2xl text-purple-400 font-bold animate-pulse">
            Loading challenge...
          </p>
        </div>
      </div>
    );

  return (
    <div
      className="min-h-screen p-6 relative overflow-hidden"
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
          background: rgba(0, 0, 0, 0.92);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .glow-text {
          text-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
        }
        .code-editor {
          background: rgba(0, 0, 0, 0.9);
          border: 2px solid rgba(128, 0, 255, 0.3);
        }
        .code-editor:focus {
          border-color: rgba(128, 0, 255, 0.6);
          box-shadow: 0 0 20px rgba(128, 0, 255, 0.3);
        }
      `}</style>

      <button
        onClick={handleLogout}
        className="absolute top-6 right-8 z-20 flex items-center gap-2 px-4 py-2 rounded-xl glass-morphism border border-red-500/30 text-red-400 hover:text-red-300 hover:border-red-400/50 transition-all duration-300 hover:scale-105 group"
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

      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <FloatingBug key={i} delay={i * 0.7} />
        ))}
      </div>

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {showSuccessPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm"></div>
            <div className="relative glass-morphism rounded-3xl p-8 max-w-md w-full border-2 border-green-500/30 shadow-2xl animate-[fadeIn_0.3s_ease-in-out]">
              <div className="text-center">
                <Trophy
                  size={64}
                  className="text-green-400 mx-auto mb-4 animate-bounce"
                  style={{ filter: "drop-shadow(0 0 20px #00ff80)" }}
                />
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400 glow-text mb-4">
                  MISSION ACCOMPLISHED!
                </h2>
                <p className="text-green-300 text-lg font-bold mb-4">
                  Bug eliminated successfully!
                </p>
                <div className="bg-green-500/20 rounded-2xl p-4 border border-green-500/30 mb-4">
                  <p className="text-green-300 font-bold text-xl">
                    +{xpMap[difficulty?.toLowerCase()] || 0} XP Earned!
                  </p>
                  <p className="text-green-400 text-sm mt-1">
                    Total XP: {user?.XP?.toLocaleString() || 0}
                  </p>
                  {user?.streak && (
                    <p className="text-yellow-400 text-sm mt-1">
                      🔥 Streak: {user.streak} days
                    </p>
                  )}
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <Button
                    onClick={() => router.push("/dashboard")}
                    className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-green-500 shadow-lg transition-all hover:scale-105"
                  >
                    Go to Dashboard
                  </Button>
                  <Button
                    onClick={handleNextChallenge}
                    className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-violet-500 shadow-lg transition-all hover:scale-105"
                  >
                    Next Challenge
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {user && (
          <div className="text-right mb-6 glass-morphism rounded-2xl p-4 inline-block ml-auto">
            <div className="text-purple-300 text-sm uppercase tracking-widest font-mono mb-1">
              Hunter XP
            </div>
            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 glow-text">
              {(user.XP || 0).toLocaleString()}
            </div>
            {user.streak > 0 && (
              <div className="text-yellow-400 text-sm mt-1 flex items-center justify-end gap-1">
                🔥 {user.streak} day streak
              </div>
            )}
          </div>
        )}

        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Target
              size={40}
              className="text-purple-400 animate-pulse"
              style={{ filter: "drop-shadow(0 0 15px #8000ff)" }}
            />
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 glow-text">
              {challenge.title || "BUG HUNT MISSION"}
            </h1>
          </div>

          <div className="flex justify-center flex-wrap gap-4 mt-6">
            <span className="glass-morphism px-4 py-2 rounded-full text-purple-300 font-bold uppercase tracking-wider border border-purple-500/30">
              {challenge.language}
            </span>
            <span
              className={`px-4 py-2 rounded-full font-bold uppercase tracking-wider border ${
                difficulty === "easy"
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : difficulty === "medium"
                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  : "bg-red-500/20 text-red-400 border-red-500/30"
              }`}
            >
              {challenge.difficulty}
            </span>
            <span className="glass-morphism px-4 py-2 rounded-full text-cyan-300 font-bold uppercase tracking-wider border border-cyan-500/30 flex items-center gap-2">
              <Trophy size={16} className="text-yellow-400" />
              {xpMap[difficulty?.toLowerCase()] || 0} XP
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <Card className="glass-morphism bg-transparent shadow-2xl rounded-3xl border-2 border-purple-500/30 overflow-hidden">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-white glow-text mb-6 flex items-center gap-3">
                  <Bug className="text-purple-400" size={28} />
                  Mission Briefing
                </h2>
                <p className="text-gray-300 text-lg leading-relaxed font-mono">
                  {challenge.description}
                </p>
              </CardContent>
            </Card>

            <Card className="glass-morphism bg-transparent shadow-2xl rounded-3xl border-2 border-red-500/30 overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white glow-text flex items-center gap-3">
                    <Target className="text-red-400" size={28} />
                    Infected Code
                  </h2>
                  <Button
                    onClick={handleCopy}
                    className="bg-purple-600/80 hover:bg-purple-500 border border-purple-400/30 text-white flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105"
                    size="sm"
                    type="button"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>

                <div className="relative bg-black/90 rounded-2xl p-6 font-mono text-green-400 overflow-auto max-h-96 border border-red-500/30">
                  <pre className="whitespace-pre-wrap text-sm">
                    {challenge.buggyCode}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="glass-morphism bg-transparent shadow-2xl rounded-3xl border-2 border-green-500/30 overflow-hidden">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-white glow-text mb-6 flex items-center gap-3">
                  <Shield className="text-green-400" size={28} />
                  Your Fix
                </h2>

                <label className="block text-gray-300 font-semibold mb-4 font-mono uppercase tracking-wider">
                  Debugged Code:
                </label>

                <textarea
                  id="userCode"
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  rows={12}
                  spellCheck={false}
                  className="w-full rounded-xl p-4 font-mono text-sm resize-y focus:outline-none transition-all code-editor text-green-400"
                  placeholder="Eliminate the bugs and restore the code..."
                />

                <div className="flex gap-4 mt-6 flex-wrap">
                  <Button
                    onClick={handleRun}
                    disabled={loading || runningCode}
                    className="font-semibold rounded-xl transition-all hover:scale-105 disabled:opacity-50 px-6 py-3 flex items-center gap-2"
                    style={{
                      background:
                        loading || runningCode
                          ? "rgba(75, 85, 99, 0.8)"
                          : "linear-gradient(45deg, #8000ff, #ff0080)",
                      boxShadow:
                        loading || runningCode
                          ? "none"
                          : "0 0 20px rgba(128, 0, 255, 0.4)",
                    }}
                    type="button"
                  >
                    <Play size={16} />
                    {loading
                      ? "Queued..."
                      : runningCode
                      ? "Running..."
                      : "Execute Code"}
                  </Button>

                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="font-semibold rounded-xl transition-all hover:scale-105 disabled:opacity-50 px-6 py-3 flex items-center gap-2"
                    style={{
                      background: loading
                        ? "rgba(75, 85, 99, 0.8)"
                        : "linear-gradient(45deg, #00ff80, #8000ff)",
                      boxShadow: loading
                        ? "none"
                        : "0 0 20px rgba(0, 255, 128, 0.4)",
                    }}
                    type="button"
                  >
                    <Shield size={16} />
                    Submit Solution
                  </Button>
                </div>
              </CardContent>
            </Card>

            {output && (
              <Card className="glass-morphism bg-transparent shadow-2xl rounded-3xl border-2 border-cyan-500/30 overflow-hidden">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-white glow-text mb-6 flex items-center gap-3">
                    <Play className="text-cyan-400" size={28} />
                    Execution Output
                  </h2>
                  <div className="bg-black/90 text-cyan-400 p-6 rounded-2xl font-mono text-sm whitespace-pre-wrap border border-cyan-500/30">
                    <pre>{output}</pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {submitResult && (
              <Card
                className={`shadow-2xl rounded-3xl border-2 overflow-hidden ${
                  submitResult.success
                    ? "glass-morphism border-green-500/30"
                    : "glass-morphism border-red-500/30"
                }`}
              >
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-white glow-text mb-6 flex items-center gap-3">
                    {submitResult.success ? (
                      <Trophy className="text-green-400" size={28} />
                    ) : (
                      <Target className="text-red-400" size={28} />
                    )}
                    Mission Status
                  </h2>
                  <div
                    className={`p-6 rounded-2xl text-center font-bold text-lg border-2 ${
                      submitResult.success
                        ? "bg-green-500/20 text-green-300 border-green-500/30"
                        : "bg-red-500/20 text-red-300 border-red-500/30"
                    }`}
                  >
                    {submitResult.message ||
                      (submitResult.success
                        ? "🎉 Mission Accomplished!"
                        : "❌ Mission Failed - Try Again!")}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main exported component with Suspense wrapper
export default function Challenge() {
  return (
    <Suspense fallback={<LoadingChallenge />}>
      <ChallengeContent />
    </Suspense>
  );
}