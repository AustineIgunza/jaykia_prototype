"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/motion";
import { useAuth, TwoFactorRequiredError } from "@/lib/auth/context";
import { getRoleTier } from "@/lib/auth/roles";

export default function LoginPage() {
  const { login, verify2FA } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 2FA state
  const [twoFactorStep, setTwoFactorStep] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first OTP input
  useEffect(() => {
    if (twoFactorStep) {
      inputRefs.current[0]?.focus();
    }
  }, [twoFactorStep]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const loggedInUser = await login({ email, password });
      const tier = getRoleTier(loggedInUser.roles);
      router.push(tier === "customer" ? "/auth/account" : "/admin");
    } catch (err) {
      if (err instanceof TwoFactorRequiredError) {
        setTempToken(err.tempToken);
        setTwoFactorStep(true);
      } else {
        setError(err instanceof Error ? err.message : "Login failed");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify2FA() {
    const code = otpDigits.join("");
    if (code.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const loggedInUser = await verify2FA(tempToken, code);
      const tier = getRoleTier(loggedInUser.roles);
      router.push(tier === "customer" ? "/auth/account" : "/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
      setOtpDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  function handleOtpChange(index: number, value: string) {
    if (value && !/^\d$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter" && otpDigits.every((d) => d)) {
      handleVerify2FA();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || "";
    }
    setOtpDigits(newDigits);
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  }

  if (twoFactorStep) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-6">
        <FadeIn className="w-full max-w-md">
          <Card>
            <CardContent>
              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="5" y="11" width="14" height="10" rx="2" stroke="var(--jk-gold)" strokeWidth="1.5" />
                    <path d="M8 11V7a4 4 0 118 0v4" stroke="var(--jk-gold)" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <h1 className="font-display text-2xl font-bold mb-1">Two-Factor Authentication</h1>
                <p className="text-sm text-muted">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <div className="flex justify-center gap-2 mb-6" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-bold rounded-[var(--radius-md)] border border-border bg-surface text-foreground focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              {error && (
                <p className="text-sm text-error text-center mb-4">{error}</p>
              )}

              <Button
                onClick={handleVerify2FA}
                loading={loading}
                className="w-full"
                disabled={otpDigits.some((d) => !d)}
              >
                Verify
              </Button>

              <button
                type="button"
                onClick={() => {
                  setTwoFactorStep(false);
                  setTempToken("");
                  setOtpDigits(["", "", "", "", "", ""]);
                  setError("");
                }}
                className="w-full text-sm text-muted hover:text-foreground transition-colors mt-4 text-center cursor-pointer"
              >
                Back to Sign In
              </button>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-6">
      <FadeIn className="w-full max-w-md">
      <Card>
        <CardContent>
          <h1 className="font-display text-2xl font-bold text-center mb-2">Welcome Back</h1>
          <p className="text-sm text-muted text-center mb-8">
            Sign in to manage your bookings
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {error && (
              <p className="text-sm text-error">{error}</p>
            )}

            <Button type="submit" loading={loading} className="w-full">
              Sign In
            </Button>
          </form>

          <p className="text-sm text-muted text-center mt-6">
            Don&rsquo;t have an account?{" "}
            <Link href="/auth/register" className="text-accent hover:text-accent-light transition-colors">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
      </FadeIn>
    </div>
  );
}
