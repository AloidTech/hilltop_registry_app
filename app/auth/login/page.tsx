"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
} from "firebase/auth";
// Adjust import if you use a different path/alias
import { auth } from "../../../lib/clientApp";

type Errors = {
  email?: string;
  password?: string;
  general?: string;
  info?: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const validateEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const canSubmit = useMemo(() => {
    if (!email.trim() || !password.trim()) return false;
    if (!validateEmail(email)) return false;
    return !submitting;
  }, [email, password, submitting]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    if (!email.trim()) return setErrors({ email: "Email is required." });
    if (!validateEmail(email))
      return setErrors({ email: "Enter a valid email." });
    if (!password.trim())
      return setErrors({ password: "Password is required." });

    try {
      setSubmitting(true);
      await setPersistence(
        auth,
        remember ? browserLocalPersistence : browserSessionPersistence
      );
      await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );
      router.push("/");
    } catch (e: unknown) {
      const code =
        e && typeof e === "object" && "code" in e
          ? String((e as { code?: unknown }).code ?? "")
          : "";
      const map: Record<string, string> = {
        "auth/invalid-credential": "Invalid email or password.",
        "auth/user-not-found": "No account matches this email.",
        "auth/wrong-password": "Invalid email or password.",
        "auth/too-many-requests": "Too many attempts. Try again later.",
      };
      setErrors({ general: map[code] || "Failed to sign in." });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgotPassword() {
    setErrors({});
    if (!email.trim() || !validateEmail(email)) {
      setErrors({ email: "Enter a valid email to reset your password." });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      setErrors({ info: "Password reset email sent." });
    } catch {
      setErrors({ general: "Could not send reset email." });
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background:
          "radial-gradient(1200px 600px at 20% 0%, rgba(255,160,122,0.45), rgba(0,0,0,0)), radial-gradient(1200px 800px at 100% 0%, rgba(147,112,219,0.45), rgba(0,0,0,0)), #0f0f12",
      }}
    >
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20">
        <h1 className="text-3xl font-bold text-white">Login in</h1>
        <p className="mt-1 text-sm text-white/80">
          Don’t have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-white underline underline-offset-4 hover:text-white/90"
          >
            Sign up
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm text-white/90 mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full rounded-md px-3 py-2 bg-white/10 text-white placeholder-white/60 border ${
                errors.email
                  ? "border-red-400 focus:ring-2 focus:ring-red-400"
                  : "border-white/30 focus:ring-2 focus:ring-white focus:border-white/80"
              } focus:outline-none`}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-300">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm text-white/90 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-md pr-10 px-3 py-2 bg-white/10 text-white placeholder-white/60 border ${
                  errors.password
                    ? "border-red-400 focus:ring-2 focus:ring-red-400"
                    : "border-white/30 focus:ring-2 focus:ring-white focus:border-white/80"
                } focus:outline-none`}
                placeholder="Your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute inset-y-0 right-0 pr-3 text-white/80 hover:text-white"
                aria-label={showPw ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPw ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-300">{errors.password}</p>
            )}
            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-white/80 hover:text-white underline underline-offset-4"
              >
                Forgot password?
              </button>
            </div>
          </div>

          {/* Remember me */}
          <label className="flex items-center gap-3 text-sm text-white/90">
            <input
              type="checkbox"
              className="h-4 w-4 accent-white"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>Remember me on this device</span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full rounded-full py-3 text-sm font-semibold transition ${
              canSubmit
                ? "bg-white text-neutral-900 hover:bg-white/90"
                : "bg-white/30 text-white/60 cursor-not-allowed"
            }`}
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>

          {errors.general && (
            <p className="text-sm text-red-300 text-center">{errors.general}</p>
          )}
          {errors.info && (
            <p className="text-sm text-emerald-300 text-center">
              {errors.info}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
