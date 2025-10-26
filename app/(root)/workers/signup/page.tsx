"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BiSearch, BiX } from "react-icons/bi";
import { AnimatePresence, motion } from "framer-motion";


interface Member {
  id: string;
  name: string;
}

const DUMMY_MEMBERS: Member[] = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Jane Smith" },
  { id: "3", name: "Samuel Johnson" },
  { id: "4", name: "Amaka Okoro" },
  { id: "5", name: "Carlos Rivera" },
];

// Note: Departments UI is not used on this screen; remove to avoid unused-var warnings.

type FormState = {
  memberId: string | null;
  email: string;
  department: string;
  password: string;
  confirmPassword: string;
};

/**
 * Test sign-in object used as the default value for testing.
 * Replace with empty/default values in production.
 */
const TEST_SIGNIN: FormState = {
  memberId: "2",
  email: "jane@example.com",
  department: "Youth",
  password: "Passw0rd!",
  confirmPassword: "Passw0rd!",
};

type SignupTabProps = {
  form: FormState;
  query: string;
  showDropdown: boolean;
  errors: string | null;
  filtered: Member[];
  selectedMember: Member | null;
  onQueryChange: (value: string, update: number) => void;
  onSelectMember: (member: Member) => void;
  onClearMember: () => void;
  onEmailUpdate: (email: string) => void;
  onPasswordUpdate: (password: string) => void;
  onPasswordConfirm: (password: string) => void;
  onFocusSearch: () => void;
  onBlurSearch: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onUseTest: () => void;
};

function SignupTab({
  form,
  query,
  showDropdown,
  errors,
  filtered,
  selectedMember,
  onQueryChange,
  onSelectMember,
  onClearMember,
  onEmailUpdate,
  onPasswordUpdate,
  onPasswordConfirm,
  onFocusSearch,
  onBlurSearch,
  onSubmit,
  onUseTest,
}: SignupTabProps) {

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-md bg-neutral-800/60 border border-neutral-700 rounded-xl p-6 space-y-4"
    >
      <h2 className="text-white text-xl font-semibold">Sign up</h2>

      <div className="relative">
        <label className="text-sm text-gray-300 block mb-1">
          Which member are you?
        </label>
        <div className="relative">
          {!selectedMember && (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <BiSearch className="text-gray-400 w-4 h-4" />
            </span>
          )}

          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value, 1)}
            onFocus={onFocusSearch}
            onBlur={onBlurSearch}
            placeholder="Search member name..."
            className={`w-full ${
              selectedMember ? "pl-3 pr-10" : "pl-10 pr-3"
            } py-2 rounded-md bg-neutral-700 text-white placeholder-gray-400 border border-neutral-600 focus:outline-none transition-all duration-150`}
          />
          {selectedMember && (
            <button
              type="button"
              onClick={onClearMember}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-red-400 hover:text-red-300 transition-all"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-red-500/50 bg-red-500/10">
                <BiX className="w-3.5 h-3.5" />
              </span>
            </button>
          )}
        </div>
        <AnimatePresence>
          {showDropdown && (
            <motion.ul
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute z-20 w-full mt-1 max-h-52 overflow-y-auto bg-neutral-800 border border-neutral-700 rounded-md shadow-lg"
            >
              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-sm text-gray-400">No matches</li>
              ) : (
                filtered.map((m) => (
                  <li
                    key={m.id}
                    onMouseDown={(ev) => {
                      ev.preventDefault();
                      onSelectMember(m);
                    }}
                    className="px-3 py-2 text-sm text-white hover:bg-neutral-700 cursor-pointer"
                  >
                    {m.name}
                  </li>
                ))
              )}
            </motion.ul>
          )}
        </AnimatePresence>
        <p className="mt-1 text-xs text-gray-400">
          Selected:{" "}
          <span className="text-white">{selectedMember?.name ?? "none"}</span>
        </p>
      </div>

      <div>
        <label className="text-sm text-gray-300 block mb-1">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => onEmailUpdate(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-neutral-700 text-white placeholder-gray-400 border border-neutral-600 focus:outline-none"
          placeholder="you@example.com"
        />
      </div>

      {/* Password */}
      <div>
        <label className="text-sm text-gray-300 block mb-1">Password</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => onPasswordUpdate(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-neutral-700 text-white placeholder-gray-400 border border-neutral-600 focus:outline-none"
          placeholder="Enter password"
        />
      </div>

      {/* Confirm password */}
      <div>
        <label className="text-sm text-gray-300 block mb-1">
          Confirm password
        </label>
        <input
          type="password"
          value={form.confirmPassword}
          onChange={(e) => onPasswordConfirm(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-neutral-700 text-white placeholder-gray-400 border border-neutral-600 focus:outline-none"
          placeholder="Re-enter password"
        />
      </div>

      {errors && <div className="text-sm text-red-400">{errors}</div>}

      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
        >
          Create account
        </button>

        <button
          type="button"
          onClick={onUseTest}
          className="text-sm text-gray-300 underline"
        >
          Use test sign-in
        </button>
      </div>
    </form>
  );
}

type SuccessTabProps = {
  onHome: () => void;
  onReset: () => void;
};

function SuccessTab({ onHome, onReset }: SuccessTabProps) {
  return (
    <div className="w-full max-w-md bg-neutral-800/60 border border-neutral-700 rounded-xl p-6 text-center space-y-4">
      <h2 className="text-white text-2xl font-semibold">Request received</h2>
      <p className="text-gray-300 text-sm">
        We’ve logged your worker registration request. Please check your email
        for next steps.
      </p>
      <div className="flex flex-col gap-2">
        <button
          className="w-full px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
          onClick={onHome}
        >
          Go home
        </button>
        <button
          className="w-full px-4 py-2 rounded-md bg-neutral-700 hover:bg-neutral-600 text-white"
          onClick={onReset}
        >
          Submit another request
        </button>
      </div>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(TEST_SIGNIN);
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [errors, setErrors] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DUMMY_MEMBERS;
    return DUMMY_MEMBERS.filter((m) => m.name.toLowerCase().includes(q));
  }, [query]);

  const selectedMember =
    DUMMY_MEMBERS.find((m) => m.id === form.memberId) ?? null;

  const handleQueryChange = (value: string, update: number) => {
    setQuery(value);
    if (update === 1) {
      setShowDropdown(true);
      setForm((s) => ({ ...s, memberId: null }));
    }
    //Update for Email
    if (update === 2) {
      setForm((s) => ({ ...s, email: "" }));
    }
  };

  const handleSelectMember = (member: Member) => {
    setForm((s) => ({ ...s, memberId: member.id }));
    setQuery(member.name);
    setShowDropdown(false);
  };

  const handleClearMember = () => {
    setForm((s) => ({ ...s, memberId: null }));
    setQuery("");
    setShowDropdown(false);
  };

  const handleFocusSearch = () => setShowDropdown(true);
  const handleBlurSearch = () => setTimeout(() => setShowDropdown(false), 150);
  const handleEmailUpdate = (email: string) => {
    setForm((s) => ({ ...s, email: email }));
  };
  const handlePasswordUpdate = (password: string) => {
    setForm((s) => ({ ...s, password: password }));
  };
  const handlePasswordConfirm = (password: string) => {
    setForm((s) => ({ ...s, confirmPassword: password }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);

    if (!form.memberId) {
      setErrors("Please select which member you are.");
      return;
    }
    if (!form.email) {
      setErrors("Email is required.");
      return;
    }
    if (form.password.length < 6) {
      setErrors("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setErrors("Passwords do not match.");
      return;
    }

    console.log("Signup payload:", form, "member:", selectedMember);
    setSubmitted(true);
  };

  const handleUseTest = () => {
    setForm(TEST_SIGNIN);
    setQuery(
      DUMMY_MEMBERS.find((m) => m.id === TEST_SIGNIN.memberId)?.name ?? ""
    );
  };

  const handleHome = () => router.push("/");
  const handleReset = () => {
    setForm(TEST_SIGNIN);
    setQuery(
      DUMMY_MEMBERS.find((m) => m.id === TEST_SIGNIN.memberId)?.name ?? ""
    );
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen flex items-start justify-center p-6 bg-[rgb(45,46,45)]">
      {submitted ? (
        <SuccessTab onHome={handleHome} onReset={handleReset} />
      ) : (
        <SignupTab
          form={form}
          query={query}
          showDropdown={showDropdown}
          errors={errors}
          filtered={filtered}
          selectedMember={selectedMember}
          onQueryChange={handleQueryChange}
          onSelectMember={handleSelectMember}
          onClearMember={handleClearMember}
          onEmailUpdate={handleEmailUpdate}
          onPasswordUpdate={handlePasswordUpdate}
          onPasswordConfirm={handlePasswordConfirm}
          onFocusSearch={handleFocusSearch}
          onBlurSearch={handleBlurSearch}
          onSubmit={handleSubmit}
          onUseTest={handleUseTest}
        />
      )}
    </div>
  );
}
