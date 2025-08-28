"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "../../lib/api";
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

const Loading = () => (
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
        Loading...
      </p>
    </div>
  </div>
);

function ChallengeContent() {
  const [challenge, setChallenge] = useState(null);
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);
  const [userCode, setUserCode] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [running, setRunning] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);
  const debounceTimeoutRef = useRef();
  const router = useRouter();
  const searchParams = useSearchParams();

  const language = searchParams.get("language");
  const difficulty = searchParams.get("difficulty");

  const fetchChallenge = useCallback(async () => {
    if (!language || !difficulty) return;
    try {
      const data = await apiFetch(
        `/api/challenges/generate?language=${language}&difficulty=${difficulty}`
      );
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
        const data = await apiFetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data.user);
      } catch {
        localStorage.removeItem("token");
        router.push("/login");
      }
    };
    fetchUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(challenge?.buggyCode || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runCode = useCallback(async () => {
    if (!userCode) return;
    setRunning(true);
    setOutput("");
    try {
      const data = await apiFetch("/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: userCode, language }),
      });
      setOutput(data.output || "No output returned.");
    } catch {
      setOutput("Error running code.");
    }
    setRunning(false);
  }, [userCode, language]);

  const handleRun = useCallback(() => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    setLoading(true);
    debounceTimeoutRef.current = setTimeout(() => {
      setLoading(false);
      runCode();
    }, 300);
  }, [runCode]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, []);

  const handleSubmit = async () => {
    if (!userCode) return;
    setLoading(true);
    setSubmitResult(null);

    try {
      const data = await apiFetch("/api/valid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemDescription: challenge?.description,
          userCode,
          language,
        }),
      });

      if (data.success) {
        const xp = xpMap[difficulty?.toLowerCase()] || 0;
        const token = localStorage.getItem("token");
        if (token && xp > 0) {
          try {
            const xpData = await apiFetch("/api/users/add-xp", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ xp }),
            });
            setUser((prev) => ({
              ...prev,
              XP: xpData.newXP,
              streak: xpData.newStreak,
            }));
          } catch {
            setUser((prev) => ({
              ...prev,
              XP: (prev?.XP || 0) + xp,
            }));
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

  const handleNext = async () => {
    setLoadingNext(true);
    setShowSuccessPopup(false);
    await new Promise((r) => setTimeout(r, 1000));
    await fetchChallenge();
    setLoadingNext(false);
  };

  if (loadingNext) {
    return <Loading />;
  }
  if (!challenge) {
    return <Loading />;
  }

  return (
    <div
      className="min-h-screen p-6 relative"
      style={{
        background:
          "radial-gradient(circle at 20% 50%, #1a0033 0%, #000000 25%, #0d0d0d 50%, #000000 100%)",
        backgroundSize: "200% 200%",
        animation: "gradientShift 8s infinite ease",
      }}
    >
      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
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

      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div className="glass-morphism rounded-xl p-8 max-w-md border border-green-500 shadow-lg relative z-50">
            <div className="text-center">
              <Trophy size={64} className="mb-4 text-green-400" />
              <h2 className="text-3xl font-black text-transparent bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text mb-4">
                MISSION ACCOMPLISHED!
              </h2>
              <p className="text-green-300 mb-4">
                Bug eliminated successfully!
              </p>
              <div className="bg-green-900 p-4 rounded-lg mb-6 border border-green-600">
                <p className="font-bold text-white text-xl">
                  +{xpMap[difficulty?.toLowerCase()] || 0} XP
                </p>
                <p className="text-green-400">
                  Total XP: {user?.XP?.toLocaleString() ?? 0}
                </p>
                {user?.streak && (
                  <p className="text-yellow-400">🔥 {user.streak} day streak</p>
                )}
              </div>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
                >
                  Go to Dashboard
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded"
                >
                  Next Challenge
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row max-w-7xl mx-auto gap-8 z-10 relative">
        <div className="md:w-1/2">
          <Card className="glass-morphism shadow-xl border border-purple-700">
            <CardContent>
              <h3 className="text-white text-2xl font-bold mb-4 flex items-center gap-2">
                <Bug /> Mission Briefing
              </h3>
              <p className="text-gray-300 whitespace-pre-wrap font-mono">
                {challenge.description}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-1/2 flex flex-col gap-4">
          <Card className="glass-morphism shadow-xl border border-green-700 flex flex-col">
            <CardContent className="flex-grow flex flex-col">
              <h3 className="text-white text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield /> Your Fix
              </h3>
              <textarea
                className="code-editor flex-grow w-full p-4 text-green-400 font-mono rounded-md bg-transparent resize-y focus:outline-none"
                rows={12}
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                spellCheck={false}
              />
              <div className="flex mt-4 gap-4">
                <Button
                  onClick={handleRun}
                  disabled={loading || running}
                  className="flex items-center gap-2"
                >
                  <Play size={16} />
                  {loading || running ? "Running..." : "Run"}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Shield size={16} />
                  Submit
                </Button>
              </div>
            </CardContent>
            {output && (
              <CardContent>
                <h4 className="text-white mb-2 flex items-center gap-2">
                  <Play /> Execution Output
                </h4>
                <pre className="text-green-400 font-mono whitespace-pre-wrap">
                  {output}
                </pre>
              </CardContent>
            )}
          </Card>
          {submitResult && (
            <Card
              className={`shadow-xl border ${
                submitResult.success ? "border-green-600" : "border-red-600"
              }`}
            >
              <CardContent>
                <h4
                  className={`text-2xl font-bold ${
                    submitResult.success ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {submitResult.success ? (
                    <Trophy className="inline-block" />
                  ) : (
                    <Target className="inline-block" />
                  )}{" "}
                  Mission Status
                </h4>
                <p>
                  {submitResult.message ||
                    (submitResult.success ? "Success!" : "Try again.")}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(8)].map((_, i) => (
          <FloatingBug key={i} delay={i * 0.6} />
        ))}
      </div>

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
        .code-editor {
          background: rgba(0, 0, 0, 0.9);
          border: 2px solid rgba(128, 0, 255, 0.3);
          border-radius: 8px;
          transition: border-color 0.3s ease;
        }
        .code-editor:focus {
          border-color: rgba(128, 0, 255, 0.6);
          box-shadow: 0 0 20px rgba(128, 0, 255, 0.3);
          outline: none;
        }
      `}</style>
    </div>
  );
}

export default function ChallengePage() {
  return (
    <Suspense fallback={<Loading />}>
      <ChallengeContent />
    </Suspense>
  );
}
