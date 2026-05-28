"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/motion";
import { useAuth } from "@/lib/auth/context";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await register({ username, email, password });
      const raw = new URLSearchParams(window.location.search).get("returnTo");
      const safe = raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : null;
      router.push(safe ?? "/auth/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-6">
      <FadeIn className="w-full max-w-md">
      <Card>
        <CardContent>
          <h1 className="font-display text-2xl font-bold text-center mb-2">Create Account</h1>
          <p className="text-sm text-muted text-center mb-8">
            Join JayKia for seamless airport transfers
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="name"
            />
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
              autoComplete="new-password"
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />

            {error && (
              <p className="text-sm text-error">{error}</p>
            )}

            <Button type="submit" loading={loading} className="w-full">
              Create Account
            </Button>
          </form>

          <p className="text-sm text-muted text-center mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-accent hover:text-accent-light transition-colors">
              Sign In
            </Link>
          </p>
        </CardContent>
      </Card>
      </FadeIn>
    </div>
  );
}
