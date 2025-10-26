"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Wire to backend/user profile when ready
    alert("Settings saved (stub)");
  };

  return (
    <div className="min-h-screen w-full bg-neutral-900 text-neutral-100">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Settings</h1>

        <form onSubmit={onSave} className="space-y-6 bg-neutral-800/50 p-5 rounded-lg border border-neutral-700/40">
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Display name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="w-full px-3 py-2 rounded-md bg-neutral-800 border border-neutral-700 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="emailNotifications"
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="h-4 w-4 accent-indigo-500"
            />
            <label htmlFor="emailNotifications" className="text-sm text-neutral-300">
              Email notifications
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
