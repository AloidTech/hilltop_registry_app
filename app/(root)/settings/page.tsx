"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/ClientAuth";
import { auth } from "@/lib/clientApp";
import {
  signOut,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBell,
  FiUser,
  FiLock,
  FiLogOut,
  FiChevronRight,
  FiHelpCircle,
  FiShield,
  FiActivity,
  FiArrowLeft,
  FiCamera,
  FiSettings,
  FiMonitor,
} from "react-icons/fi";

// --- Types ---

type ViewState = "main" | "edit-profile" | "change-password";

interface UserProfile {
  name?: string;
  email?: string;
  marketingOptOut?: boolean;
}

// --- Components ---

// --- Desktop Components ---

const DesktopMenuItem = ({
  icon: Icon,
  label,
  description,
  onClick,
  active = false,
  danger = false,
}: {
  icon: React.ComponentType<{ size: number }>;
  label: string;
  description?: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 transition-colors rounded-lg ${
      active
        ? "bg-neutral-700/50"
        : danger
          ? "hover:bg-red-500/10"
          : "hover:bg-neutral-800/50"
    }`}
  >
    <div
      className={`p-2 rounded-full ${danger ? "text-red-500" : "text-neutral-400"}`}
    >
      <Icon size={20} />
    </div>
    <div className="text-left">
      <span
        className={`block font-medium text-sm ${danger ? "text-red-500" : "text-neutral-200"}`}
      >
        {label}
      </span>
      {description && (
        <span className="block text-xs text-neutral-500">{description}</span>
      )}
    </div>
  </button>
);

// --- Mobile Components ---

const LoadingPulse = () => (
  <div className="w-full min-h-screen flex flex-col bg-[var(--bg-primary)]">
    {/* Dark section skeleton */}
    <div className="bg-[var(--bg-secondary)] px-6 pt-6 pb-10 rounded-b-[2.5rem]">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-24 h-24 skeleton-shimmer rounded-full" />
        <div className="w-48 h-6 skeleton-shimmer rounded" />
        <div className="w-32 h-4 skeleton-shimmer rounded" />
      </div>
      <div className="flex justify-between gap-4 mt-8">
        <div className="h-20 flex-1 skeleton-shimmer rounded-2xl" />
        <div className="h-20 flex-1 skeleton-shimmer rounded-2xl" />
        <div className="h-20 flex-1 skeleton-shimmer rounded-2xl" />
      </div>
    </div>
    {/* Dark bottom section skeleton */}
    <div className="bg-[var(--bg-primary)] flex-1 px-6 pt-8 space-y-4">
      <div className="h-14 w-full skeleton-shimmer rounded-xl" />
      <div className="h-14 w-full skeleton-shimmer rounded-xl" />
      <div className="h-14 w-full skeleton-shimmer rounded-xl" />
    </div>
  </div>
);

const MobileHeader = ({
  title,
  onBack,
  dark = true,
}: {
  title: string;
  onBack?: () => void;
  dark?: boolean;
}) => (
  <div className="flex items-center justify-between mb-6">
    {onBack ? (
      <button
        onClick={onBack}
        className={`p-2 -ml-2 rounded-full transition-colors ${dark ? "hover:bg-neutral-800 text-neutral-300" : "hover:bg-neutral-200 text-neutral-600"}`}
      >
        <FiArrowLeft size={22} />
      </button>
    ) : (
      <div className="w-10" />
    )}
    <h1
      className={`text-lg font-semibold ${dark ? "text-white" : "text-neutral-900"}`}
    >
      {title}
    </h1>
    <div className="w-10" />
  </div>
);

const StatBox = ({
  icon: Icon,
  label,
  value,
  active,
}: {
  icon: React.ComponentType<{ size: number; className?: string }>;
  label: string;
  value: string | number;
  active?: boolean;
}) => (
  <div
    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${active ? "bg-neutral-800/80 border-neutral-700" : "bg-neutral-800/40 border-neutral-700/50"}`}
  >
    <div className="mb-2 p-2.5 rounded-full bg-neutral-700/50">
      <Icon size={18} className="text-white" />
    </div>
    <span className="text-[11px] text-neutral-400 mb-0.5">{label}</span>
    <span className="text-xs font-medium text-white">{value}</span>
  </div>
);

const MobileMenuItem = ({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ComponentType<{ size: number }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between py-4 border-b border-neutral-100 hover:bg-neutral-50 transition-colors group"
  >
    <div className="flex items-center gap-4">
      <div
        className={`p-2 rounded-full ${danger ? "bg-red-50 text-red-500" : "bg-neutral-100 text-neutral-600"}`}
      >
        <Icon size={20} />
      </div>
      <span
        className={`font-medium ${danger ? "text-red-500" : "text-neutral-800"}`}
      >
        {label}
      </span>
    </div>
    {!danger && (
      <FiChevronRight className="text-neutral-400 group-hover:text-neutral-600" />
    )}
  </button>
);

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [view, setView] = useState<ViewState>("main");
  const [loading, setLoading] = useState(false);

  // Profile Data
  const [profile, setProfile] = useState<UserProfile>({});
  const [editName, setEditName] = useState("");
  const [editMarketing, setEditMarketing] = useState(false);

  // Password Data
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetch(`/api/profile?user_id=${user.uid}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.ok && data.profile) {
            setProfile(data.profile);
            setEditName(data.profile.name || "");
            // marketingOptOut = true means "Opted Out".
            setEditMarketing(data.profile.marketingOptOut || false);
          }
          setLoading(false);
        })
        .catch((e) => {
          console.error(e);
          setLoading(false);
        });
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/auth/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.uid,
          name: editName,
          marketingOptOut: editMarketing,
        }),
      });

      if (res.ok) {
        setProfile({
          ...profile,
          name: editName,
          marketingOptOut: editMarketing,
        });
        setMessage({ type: "success", text: "Profile updated" });
        setTimeout(() => {
          setMessage(null);
          setView("main"); // Go back automatically
        }, 1500);
      } else {
        setMessage({ type: "error", text: "Failed to update" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    if (passwords.new !== passwords.confirm) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }
    if (passwords.new.length < 6) {
      setMessage({ type: "error", text: "Password too short" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Re-authenticate first
      const credential = EmailAuthProvider.credential(
        user.email,
        passwords.current,
      );
      await reauthenticateWithCredential(user, credential);

      // Update
      await updatePassword(user, passwords.new);

      setMessage({ type: "success", text: "Password changed successfully" });
      setPasswords({ current: "", new: "", confirm: "" });
      setTimeout(() => {
        setMessage(null);
        setView("main");
      }, 1500);
    } catch (err: unknown) {
      console.error(err);
      const firebaseError = err as { code?: string };
      if (
        firebaseError.code === "auth/invalid-credential" ||
        firebaseError.code === "auth/wrong-password"
      ) {
        setMessage({ type: "error", text: "Current password incorrect" });
      } else {
        setMessage({ type: "error", text: "Failed to change password" });
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <LoadingPulse />;
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950 p-6">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-neutral-800/50">
            <FiUser size={32} className="text-neutral-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Sign In Required
          </h1>
          <p className="text-neutral-400 mb-8">
            Please sign in or create an account to access your settings and
            profile.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => router.push("/auth/login")}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push("/auth/signup")}
              className="w-full py-3.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-medium transition-colors border border-neutral-700"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const PageTransition = {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  };

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden lg:flex h-screen bg-neutral-950">
        {/* Desktop Sidebar */}
        <div className="w-80 bg-neutral-900 border-r border-neutral-800 flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-neutral-800">
            <h1 className="text-xl font-semibold text-white">Settings</h1>
          </div>

          {/* Search */}
          <div className="p-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search settings"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 pl-10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
              />
              <svg
                className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Profile Section */}
          <button
            onClick={() => setView("edit-profile")}
            className={`mx-3 p-3 flex items-center gap-3 rounded-lg transition-colors ${view === "edit-profile" ? "bg-neutral-700/50" : "hover:bg-neutral-800/50"}`}
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center text-xl font-bold text-neutral-700">
              {profile.name?.charAt(0).toUpperCase() ||
                user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-white">
                {profile.name || "User"}
              </h3>
              <p className="text-xs text-neutral-400 truncate max-w-[160px]">
                {profile.email || user?.email}
              </p>
            </div>
          </button>

          <div className="h-px bg-neutral-800 mx-4 my-2" />

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto px-3 space-y-1">
            <DesktopMenuItem
              icon={FiMonitor}
              label="General"
              description="Startup and close"
              onClick={() => setView("main")}
              active={view === "main"}
            />
            <DesktopMenuItem
              icon={FiUser}
              label="Account"
              description="Security notifications, account info"
              onClick={() => setView("edit-profile")}
              active={view === "edit-profile"}
            />
            <DesktopMenuItem
              icon={FiLock}
              label="Privacy"
              description="Password and security"
              onClick={() => setView("change-password")}
              active={view === "change-password"}
            />
            <DesktopMenuItem
              icon={FiBell}
              label="Notifications"
              description="Email notifications"
              onClick={() => setView("edit-profile")}
            />
            <DesktopMenuItem
              icon={FiHelpCircle}
              label="Help and feedback"
              description="Help centre, contact us"
              onClick={() => alert("Contact support@hilltop.com")}
            />
          </div>

          {/* Logout */}
          <div className="p-3 border-t border-neutral-800">
            <DesktopMenuItem
              icon={FiLogOut}
              label="Log out"
              onClick={handleLogout}
              danger
            />
          </div>
        </div>

        {/* Desktop Content Area */}
        <div className="flex-1 bg-neutral-950 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {view === "main" && (
              <motion.div
                key="main-desktop"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-neutral-800 flex items-center justify-center">
                  <FiSettings size={36} className="text-neutral-500" />
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Settings
                </h2>
                <p className="text-neutral-500 max-w-sm">
                  Select a setting from the sidebar to view or modify your
                  preferences
                </p>
              </motion.div>
            )}

            {view === "edit-profile" && (
              <motion.div
                key="edit-desktop"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-lg p-8"
              >
                <h2 className="text-2xl font-semibold text-white mb-8">
                  Edit Profile
                </h2>

                <div className="flex justify-center mb-8">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center relative shadow-lg">
                    <span className="text-4xl font-bold text-neutral-700">
                      {editName?.charAt(0).toUpperCase() ||
                        user?.email?.charAt(0).toUpperCase()}
                    </span>
                    <div className="absolute -bottom-1 -right-1 p-2.5 bg-indigo-600 rounded-full text-white shadow border-2 border-neutral-950 cursor-pointer hover:bg-indigo-500 transition-colors">
                      <FiCamera size={16} />
                    </div>
                  </div>
                </div>

                <form onSubmit={saveProfile} className="space-y-6">
                  <div>
                    <label className="block text-xs text-neutral-500 mb-2 font-medium uppercase tracking-wide">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-500 mb-2 font-medium uppercase tracking-wide">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email || user?.email || ""}
                      disabled
                      className="w-full bg-neutral-900/50 border border-neutral-800 rounded-lg px-4 py-3 text-neutral-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="bg-neutral-900 rounded-xl p-4 flex items-center justify-between border border-neutral-800">
                    <div>
                      <h3 className="text-sm font-medium text-white">
                        Marketing Emails
                      </h3>
                      <p className="text-xs text-neutral-500">
                        Receive news and updates
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditMarketing(!editMarketing)}
                      className={`w-12 h-6 rounded-full relative transition-colors ${!editMarketing ? "bg-indigo-600" : "bg-neutral-700"}`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${!editMarketing ? "left-7" : "left-1"}`}
                      />
                    </button>
                  </div>

                  {message && (
                    <div
                      className={`p-3 rounded-lg text-sm text-center ${message.type === "success" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}
                    >
                      {message.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {view === "change-password" && (
              <motion.div
                key="password-desktop"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-lg p-8"
              >
                <h2 className="text-2xl font-semibold text-white mb-8">
                  Change Password
                </h2>

                <form onSubmit={changePassword} className="space-y-6">
                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                    <p className="text-xs text-amber-200 leading-relaxed">
                      Create a strong password with at least 6 characters. You
                      will need to re-login after changing your password.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-500 mb-2 font-medium uppercase tracking-wide">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwords.current}
                      onChange={(e) =>
                        setPasswords({ ...passwords, current: e.target.value })
                      }
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-500 mb-2 font-medium uppercase tracking-wide">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwords.new}
                      onChange={(e) =>
                        setPasswords({ ...passwords, new: e.target.value })
                      }
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-500 mb-2 font-medium uppercase tracking-wide">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) =>
                        setPasswords({ ...passwords, confirm: e.target.value })
                      }
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
                      placeholder="••••••••"
                    />
                  </div>

                  {message && (
                    <div
                      className={`p-3 rounded-lg text-sm text-center ${message.type === "success" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}
                    >
                      {message.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    ) : (
                      "Change Password"
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen w-full bg-white overflow-hidden relative">
        <div className="min-h-screen flex flex-col relative overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            {view === "main" && (
              <motion.div
                key="main"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: "-20%" }}
                className="flex flex-col min-h-screen"
              >
                {loading && !profile.name ? (
                  <LoadingPulse />
                ) : (
                  <>
                    {/* Dark Top Section */}
                    <div className="bg-neutral-900 px-6 pt-6 pb-8 rounded-b-[2.5rem] relative">
                      <MobileHeader title="Profile" />

                      {/* Profile Card */}
                      <div className="flex flex-col items-center mb-6">
                        <div className="relative mb-3 group cursor-pointer">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-200 to-orange-300 border-4 border-neutral-800 flex items-center justify-center shadow-2xl overflow-hidden">
                            <span className="text-3xl font-bold text-neutral-700">
                              {profile.name?.charAt(0).toUpperCase() ||
                                user.email?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-0.5">
                          {profile.name || "User"}
                        </h2>
                        <p className="text-neutral-400 text-sm">
                          {profile.email || user.email}
                        </p>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-3">
                        <StatBox
                          icon={FiBell}
                          label="Notification"
                          value={profile.marketingOptOut ? "Off" : "On"}
                          active={!profile.marketingOptOut}
                        />
                        <StatBox
                          icon={FiShield}
                          label="Role"
                          value="Member"
                          active={true}
                        />
                        <StatBox
                          icon={FiActivity}
                          label="Status"
                          value="Active"
                          active={true}
                        />
                      </div>
                    </div>

                    {/* White Bottom Section */}
                    <div className="flex-1 bg-white px-6 pt-6 pb-24">
                      {/* Menu */}
                      <div className="space-y-1">
                        <MobileMenuItem
                          icon={FiUser}
                          label="Edit Profile"
                          onClick={() => setView("edit-profile")}
                        />
                        <MobileMenuItem
                          icon={FiLock}
                          label="Change Password"
                          onClick={() => setView("change-password")}
                        />
                        <MobileMenuItem
                          icon={FiHelpCircle}
                          label="Help & Support"
                          onClick={() => alert("Contact support@hilltop.com")}
                        />
                      </div>

                      <div className="mt-8 pt-4 border-t border-neutral-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 py-3 text-red-500 font-medium transition-colors hover:bg-red-50 rounded-lg px-2"
                        >
                          <div className="p-2 rounded-full bg-red-50">
                            <FiLogOut size={20} />
                          </div>
                          Log out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {view === "edit-profile" && (
              <motion.div
                key="edit"
                {...PageTransition}
                className="absolute inset-0 bg-white p-6 flex flex-col h-full z-10"
              >
                <MobileHeader
                  title="Edit Profile"
                  onBack={() => setView("main")}
                  dark={false}
                />

                <div className="flex justify-center mb-8">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center relative shadow-lg">
                    <span className="text-3xl font-bold text-neutral-700">
                      {editName?.charAt(0).toUpperCase() ||
                        user.email?.charAt(0).toUpperCase()}
                    </span>
                    <div className="absolute -bottom-1 -right-1 p-2 bg-indigo-600 rounded-full text-white shadow border-2 border-white">
                      <FiCamera size={14} />
                    </div>
                  </div>
                </div>

                <form onSubmit={saveProfile} className="space-y-5 flex-1">
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1.5 font-medium uppercase tracking-wide">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-transparent border-b border-neutral-200 px-1 py-2.5 text-neutral-900 focus:outline-none focus:border-indigo-500 transition-all text-base"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-500 mb-1.5 font-medium uppercase tracking-wide">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email || user.email || ""}
                      disabled
                      className="w-full bg-transparent border-b border-neutral-200 px-1 py-2.5 text-neutral-400 cursor-not-allowed text-base"
                    />
                  </div>

                  <div className="bg-neutral-50 rounded-xl p-4 flex items-center justify-between border border-neutral-100 mt-6">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-800">
                        Marketing Emails
                      </h3>
                      <p className="text-xs text-neutral-500">
                        Receive news and updates
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditMarketing(!editMarketing)}
                      className={`w-12 h-6 rounded-full relative transition-colors ${!editMarketing ? "bg-indigo-600" : "bg-neutral-300"}`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${!editMarketing ? "left-7" : "left-1"}`}
                      />
                    </button>
                  </div>

                  {message && (
                    <div
                      className={`p-3 rounded-lg text-sm text-center ${message.type === "success" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
                    >
                      {message.text}
                    </div>
                  )}

                  <div className="mt-auto pt-8 grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setView("main")}
                      className="px-6 py-3.5 rounded-full border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-100 transition-colors"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3.5 rounded-full bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      ) : (
                        "Save"
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {view === "change-password" && (
              <motion.div
                key="password"
                {...PageTransition}
                className="absolute inset-0 bg-white p-6 flex flex-col h-full z-10"
              >
                <MobileHeader
                  title="Change Password"
                  onBack={() => setView("main")}
                  dark={false}
                />

                <form
                  onSubmit={changePassword}
                  className="space-y-5 flex-1 mt-4"
                >
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6">
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Create a strong password with at least 6 characters. You
                      will need to re-login after changing your password.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-500 mb-1.5 font-medium uppercase tracking-wide">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwords.current}
                      onChange={(e) =>
                        setPasswords({ ...passwords, current: e.target.value })
                      }
                      className="w-full bg-transparent border-b border-neutral-200 px-1 py-2.5 text-neutral-900 focus:outline-none focus:border-indigo-500 transition-all"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-500 mb-1.5 font-medium uppercase tracking-wide">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwords.new}
                      onChange={(e) =>
                        setPasswords({ ...passwords, new: e.target.value })
                      }
                      className="w-full bg-transparent border-b border-neutral-200 px-1 py-2.5 text-neutral-900 focus:outline-none focus:border-indigo-500 transition-all"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-500 mb-1.5 font-medium uppercase tracking-wide">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) =>
                        setPasswords({ ...passwords, confirm: e.target.value })
                      }
                      className="w-full bg-transparent border-b border-neutral-200 px-1 py-2.5 text-neutral-900 focus:outline-none focus:border-indigo-500 transition-all"
                      placeholder="••••••••"
                    />
                  </div>

                  {message && (
                    <div
                      className={`p-3 rounded-lg text-sm text-center ${message.type === "success" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
                    >
                      {message.text}
                    </div>
                  )}

                  <div className="mt-auto pt-8">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-6 py-4 rounded-full bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      ) : (
                        "Change Password"
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
