"use client";

import { useState } from "react";

export default function OrganizationPage() {
  const [mode, setMode] = useState<"join" | "create">("join");
  const [joinCode, setJoinCode] = useState("");
  const [orgName, setOrgName] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "join") {
      alert(`Join organization with code: ${joinCode} (stub)`);
    } else {
      alert(`Create organization: ${orgName} (stub)`);
    }
  };

  return (
    <div className="min-h-screen w-full bg-neutral-900 text-neutral-100">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Organization</h1>

        <div className="mb-4 inline-flex rounded-lg overflow-hidden border border-neutral-700/50">
          <button
            className={`px-4 py-2 text-sm ${
              mode === "join" ? "bg-neutral-700/60" : "bg-neutral-800 hover:bg-neutral-700/40"
            }`}
            onClick={() => setMode("join")}
          >
            Join
          </button>
          <button
            className={`px-4 py-2 text-sm ${
              mode === "create" ? "bg-neutral-700/60" : "bg-neutral-800 hover:bg-neutral-700/40"
            }`}
            onClick={() => setMode("create")}
          >
            Create
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6 bg-neutral-800/50 p-5 rounded-lg border border-neutral-700/40">
          {mode === "join" ? (
            <div>
              <label className="block text-sm text-neutral-300 mb-1">Join code</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Enter invite/join code"
                className="w-full px-3 py-2 rounded-md bg-neutral-800 border border-neutral-700 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm text-neutral-300 mb-1">Organization name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Hilltop Chapel"
                className="w-full px-3 py-2 rounded-md bg-neutral-800 border border-neutral-700 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              {mode === "join" ? "Join Organization" : "Create Organization"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
