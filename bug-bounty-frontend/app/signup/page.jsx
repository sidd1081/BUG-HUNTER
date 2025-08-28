"use client";

import React, { useState } from "react";
import { apiFetch } from "../../lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Bug, User, Mail, Lock } from "lucide-react";

const FloatingBug = ({ delay = 0 }) => {
  return (
    <Bug
      className="absolute animate-pulse opacity-30"
      size={Math.random() * 20 + 16}
      style={{
        top: `${Math.random() * 80 + 10}%`,
        left: `${Math.random() * 80 + 10}%`,
        color: Math.random() > 0.5 ? "#ff0080" : "#8000ff",
        filter: `drop-shadow(0 0 8px ${
          Math.random() > 0.5 ? "#ff0080" : "#8000ff"
        })`,
        animationDelay: `${delay}s`,
        animationDuration: `${3 + Math.random() * 2}s`,
      }}
    />
  );
};

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await apiFetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!data || data.error || data.message === "Signup failed") {
        alert(data?.message || "Signup failed");
      } else {
        alert("Signup successful! Please login.");
        window.location.href = "/login";
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
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
        .glow-text {
          text-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
        }
        .input-glow:focus {
          box-shadow: 0 0 20px rgba(128, 0, 255, 0.3),
            0 0 40px rgba(255, 0, 128, 0.2);
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <FloatingBug key={i} delay={i * 0.5} />
        ))}
      </div>

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-purple-900/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Bug
              size={48}
              className="text-purple-400 animate-bounce"
              style={{ filter: "drop-shadow(0 0 15px #8000ff)" }}
            />
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 glow-text">
              BUG HUNTER
            </h1>
          </div>
          <p className="text-gray-400 text-sm uppercase tracking-[0.3em] font-mono">
            Join the Hunt
          </p>
        </div>

        <Card
          className="bg-black/90 shadow-2xl border-2 border-purple-500/20 rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-purple-400/30"
          style={{ backdropFilter: "blur(20px)" }}
        >
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-white glow-text mb-2">
              Join the Hunt, Hunter
            </CardTitle>
            <CardDescription className="text-gray-300 font-mono text-sm">
              Create your account to start hunting bugs
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-gray-300 font-semibold flex items-center gap-2"
                >
                  <User size={16} className="text-purple-400" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="rounded-xl bg-black/60 border-2 border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-400 focus:ring-0 transition-all duration-300 input-glow h-12 px-4"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-gray-300 font-semibold flex items-center gap-2"
                >
                  <Mail size={16} className="text-purple-400" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="hunter@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-xl bg-black/60 border-2 border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-400 focus:ring-0 transition-all duration-300 input-glow h-12 px-4"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-gray-300 font-semibold flex items-center gap-2"
                >
                  <Lock size={16} className="text-purple-400" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-xl bg-black/60 border-2 border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-400 focus:ring-0 transition-all duration-300 input-glow h-12 px-4"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl font-bold text-lg uppercase tracking-wider text-white transition-all duration-300 hover:scale-105 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: loading
                    ? "linear-gradient(45deg, #666, #888)"
                    : "linear-gradient(45deg, #ff0080, #8000ff, #00ff80)",
                  backgroundSize: "300% 300%",
                  animation: loading
                    ? "none"
                    : "gradientShift 3s ease infinite",
                  boxShadow: loading
                    ? "none"
                    : "0 0 30px rgba(255, 0, 128, 0.5), 0 0 60px rgba(128, 0, 255, 0.3)",
                }}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Creating...
                  </div>
                ) : (
                  "CREATE ACCOUNT"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center pt-4 pb-8">
            <Button
              variant="link"
              className="text-purple-300 hover:text-purple-400 transition-all duration-200 font-mono text-sm uppercase tracking-wide"
              onClick={() => (window.location.href = "/login")}
            >
              Already a Hunter?{" "}
              <span className="text-pink-400 font-bold ml-2">Login →</span>
            </Button>
          </CardFooter>
        </Card>

        <div className="text-center mt-8">
          <p className="text-gray-500 text-xs font-mono uppercase tracking-widest">
            Secure • Protected • Anonymous
          </p>
        </div>
      </div>

      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-purple-500/30 rounded-tl-3xl pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-pink-500/30 rounded-tr-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-pink-500/30 rounded-bl-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-purple-500/30 rounded-br-3xl pointer-events-none"></div>
    </div>
  );
};

export default Signup;
  