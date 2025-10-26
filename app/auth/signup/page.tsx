"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";

type FormState = {
  name: string; // username/full name
  email: string;
  password: string;
  optOut: boolean; // marketing opt-out
};

type Errors = Partial<Record<keyof FormState | "general", string>>;

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    optOut: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const validateEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  // password rules (expand as needed)
  const pwMin = form.password.trim().length >= 8;

  const canSubmit = useMemo(() => {
    const e: Errors = {};
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!validateEmail(form.email)) e.email = "Enter a valid email.";
    if (!form.name.trim()) e.name = "Username is required.";
    if (!form.password.trim()) e.password = "Password is required.";
    else if (!pwMin) e.password = "Password must be at least 8 characters.";
    return Object.keys(e).length === 0 && !submitting;
  }, [form, submitting, pwMin]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    // quick validate
    const eMap: Errors = {};
    if (!form.email.trim()) eMap.email = "Email is required.";
    else if (!validateEmail(form.email)) eMap.email = "Enter a valid email.";
    if (!form.name.trim()) eMap.name = "Username is required.";
    if (!form.password.trim()) eMap.password = "Password is required.";
    else if (!pwMin) eMap.password = "Password must be at least 8 characters.";
    if (Object.keys(eMap).length) {
      setErrors(eMap);
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          marketingOptOut: form.optOut,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setErrors({ general: err?.error || "Signup failed." });
        return;
      }
      console.log("response: ", res.json());
      setSubmitted(true);
    } catch {
      setErrors({ general: "Network error." });
    } finally {
      setSubmitting(false);
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
      {!submitted ? (
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20">
          <h1 className="text-3xl font-bold text-white">Sign up</h1>
          <p className="mt-1 text-sm text-white/80">
            Create an account or{" "}
            <Link
              href="/auth/login"
              className="text-white underline underline-offset-4 hover:text-white/90"
            >
              Login in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Username */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm text-white/90 mb-1"
              >
                Username
              </label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((s) => ({ ...s, name: e.target.value }))
                }
                className={`w-full rounded-md px-3 py-2 bg-white/10 text-white placeholder-white/60 border ${
                  errors.name
                    ? "border-red-400 focus:ring-2 focus:ring-red-400"
                    : "border-white/30 focus:ring-2 focus:ring-white focus:border-white/80"
                } focus:outline-none`}
                placeholder="janedoe"
                autoComplete="username"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-300">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm text-white/90 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((s) => ({ ...s, email: e.target.value }))
                }
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
                  value={form.password}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, password: e.target.value }))
                  }
                  className={`w-full rounded-md pr-10 px-3 py-2 bg-white/10 text-white placeholder-white/60 border ${
                    errors.password
                      ? "border-red-400 focus:ring-2 focus:ring-red-400"
                      : "border-white/30 focus:ring-2 focus:ring-white focus:border-white/80"
                  } focus:outline-none`}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
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

              {/* Password rule feedback */}
              <div className="mt-2 text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      pwMin ? "bg-emerald-500" : "bg-white/30"
                    }`}
                    aria-hidden
                  />
                  <span
                    className={pwMin ? "text-emerald-300" : "text-white/70"}
                  >
                    At least 8 characters
                  </span>
                </div>
              </div>

              {errors.password && (
                <p className="mt-1 text-xs text-red-300">{errors.password}</p>
              )}
            </div>

            {/* Opt-out checkbox */}
            <label className="flex items-start gap-3 text-sm text-white/90">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-white"
                checked={form.optOut}
                onChange={(e) =>
                  setForm((s) => ({ ...s, optOut: e.target.checked }))
                }
              />
              <span>
                I do not want to receive emails with advertising, news,
                suggestions or marketing promotions
              </span>
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
              {submitting ? "Creating..." : "Sign up"}
            </button>

            {errors.general && (
              <p className="text-sm text-red-300 text-center">
                {errors.general}
              </p>
            )}

            <p className="text-[11px] text-center text-white/80">
              By signing up to create an account, you are accepting our terms of
              service and privacy policy.
            </p>
          </form>
        </div>
      ) : (
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 text-center border border-white/20">
          <h2 className="text-2xl font-semibold text-white">Account created</h2>
          <p className="mt-2 text-sm text-white/80">
            Thanks, {form.name}. Please check your email for the next steps.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => router.push("/")}
              className="w-full rounded-full py-3 text-sm font-semibold bg-white text-neutral-900 hover:bg-white/90"
            >
              Go home
            </button>
            <button
              onClick={() => {
                setForm({ name: "", email: "", password: "", optOut: false });
                setErrors({});
                setSubmitted(false);
              }}
              className="w-full rounded-full py-3 text-sm font-semibold bg-white/10 text-white hover:bg-white/20 border border-white/30"
            >
              Create another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
