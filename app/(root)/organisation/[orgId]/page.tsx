"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/ClientAuth";
import { useRouter, useParams } from "next/navigation";
import {
  FaBuilding,
  FaFileAlt,
  FaGoogle,
  FaExternalLinkAlt,
  FaCopy,
  FaCheck,
  FaCog,
  FaUsers,
  FaArrowLeft,
  FaClock,
} from "react-icons/fa";
import Link from "next/link";
import { motion } from "framer-motion";

interface OrganizationData {
  id: string;
  name: string;
  registry_sheet: {
    name: string;
    url: string;
  };
  registry_form_url: string;
  createdAt?: string | Date | null;
}

export default function OrganizationDetailsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orgId = params?.orgId as string;

  const [orgData, setOrgData] = useState<OrganizationData | null>({
    id: "",
    name: "",
    registry_sheet: {
      name: "",
      url: "",
    },
    registry_form_url: "",
    createdAt: null,
  });
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrgData() {
      if (!user || !orgId) return;

      try {
        const res = await fetch(
          `/api/organisation?user_id=${user.uid}&org_id=${orgId}&type=byId`,
        );
        if (res.ok) {
          const data = await res.json();
          setOrgData(data.organisation);
          console.log("=====================================");
          console.log("Organisation fetch");
          console.log("  User: ", user?.uid);
          console.log("Org", data.organisation);
          console.log("=====================================");
        } else {
          const data = await res.json();
          console.error("Failed to fetch organization details: ", data.error);
          // router.push("/organization"); // Redirect if not found
        }
      } catch (error) {
        console.error("Error fetching organization:", error);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      if (!user) {
        router.push("/auth/login");
      } else {
        fetchOrgData();
      }
    }
  }, [user, authLoading, router, orgId]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-900 text-white">
        <div className="flex flex-col items-center">
          {/* Spiral/Ring Loader */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-neutral-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 border-4 border-neutral-800 rounded-full"></div>
          </div>
          <p className="mt-6 text-neutral-400 text-sm font-medium animate-pulse tracking-wide">
            INITIALIZING ORGANISATION
          </p>
        </div>
      </div>
    );
  }

  if (!orgData && (!loading || !authLoading)) {
    return (
      <div className="text-white p-10 bg-neutral-900 h-screen flex items-center justify-center">
        Organization not found or access denied.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6 md:p-12 mb-20 md:mb-0">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* Back Link */}
        <Link
          href="/organisation"
          className="group inline-flex items-center gap-2 text-neutral-400 hover:text-green-400 transition-colors mb-4 px-4 py-2 rounded-full hover:bg-neutral-800 w-fit"
        >
          <FaArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />{" "}
          Back to Organisations
        </Link>

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-neutral-800 pb-8 rounded-3xl p-6 bg-gradient-to-r from-neutral-800/20 to-transparent border border-neutral-800/50">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-neutral-800 rounded-2xl flex items-center justify-center border border-neutral-700 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-green-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <FaBuilding className="w-9 h-9 text-neutral-300 relative z-10" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                {orgData?.name}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="w-25 px-2 py-0.5 rounded text-xs font-mono truncate bg-neutral-800 text-neutral-400 border border-neutral-700 select-all">
                  ID: {orgData?.id}
                </span>
                <span className="flex items-center gap-1 text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />{" "}
                  Active
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button className="flex-1 lg:flex-none px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 group">
              <FaCog className="text-neutral-400 group-hover:rotate-90 transition-transform duration-500" />{" "}
              Settings
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-neutral-800/40 border border-neutral-700/50 p-6 rounded-2xl hover:bg-neutral-800/60 transition-colors">
            <div className="flex items-center gap-3 mb-2 text-blue-400">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FaUsers className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm uppercase tracking-wider">
                Members
              </h3>
            </div>
            <p className="text-4xl font-bold text-white mt-4">--</p>
            <p className="text-xs text-neutral-500 mt-1">Total registered</p>
          </div>
          <div className="bg-neutral-800/40 border border-neutral-700/50 p-6 rounded-2xl hover:bg-neutral-800/60 transition-colors">
            <div className="flex items-center gap-3 mb-2 text-purple-400">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <FaClock className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm uppercase tracking-wider">
                Recently Active
              </h3>
            </div>
            <p className="text-4xl font-bold text-white mt-4">--</p>
            <p className="text-xs text-neutral-500 mt-1">Visits this week</p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-neutral-200 mt-8 mb-4 flex items-center gap-2">
          Configuration
          <div className="h-px bg-neutral-800 flex-1 ml-4" />
        </h2>

        {/* Configuration Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Registry Sheet Card */}
          <div className="bg-neutral-800/30 backdrop-blur-sm rounded-2xl border border-neutral-700 overflow-hidden group hover:border-green-500/30 transition-all hover:bg-neutral-800/50 shadow-lg shadow-black/20">
            <div className="p-6 border-b border-neutral-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-green-500/10 rounded-xl text-green-400 border border-green-500/10">
                    <FaFileAlt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-neutral-200">
                      Registry Sheet
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Google Sheets Database
                    </p>
                  </div>
                </div>
                <a
                  href={orgData?.registry_sheet?.url || ""}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-all"
                  title="Open Link"
                >
                  <FaExternalLinkAlt />
                </a>
              </div>

              <div className="bg-neutral-900/50 rounded-lg p-3 border border-neutral-800">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-500 uppercase font-semibold">
                    Sheet Name
                  </span>
                </div>
                <p className="font-medium text-white truncate mt-1">
                  {orgData?.registry_sheet?.name}
                </p>
              </div>
            </div>
            <div className="p-4 bg-neutral-900/30 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-500 mb-1 uppercase tracking-wider font-semibold">
                  Sheet URL
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                  <p className="text-sm text-neutral-300 truncate font-mono opacity-80">
                    {orgData?.registry_sheet?.url}
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(orgData?.registry_sheet?.url || "", "sheet")
                }
                className="p-2.5 hover:bg-neutral-700 rounded-lg transition-all text-neutral-400 hover:text-white border border-transparent hover:border-neutral-600"
                title="Copy URL"
              >
                {copiedField === "sheet" ? (
                  <FaCheck className="text-green-500" />
                ) : (
                  <FaCopy />
                )}
              </button>
            </div>
          </div>

          {/* Form URL Card */}
          <div className="bg-neutral-800/30 backdrop-blur-sm rounded-2xl border border-neutral-700 overflow-hidden group hover:border-purple-500/30 transition-all hover:bg-neutral-800/50 shadow-lg shadow-black/20">
            <div className="p-6 border-b border-neutral-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/10">
                    <FaGoogle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-neutral-200">
                      Registration Form
                    </h3>
                    <p className="text-xs text-neutral-500">
                      User Sign-up Form
                    </p>
                  </div>
                </div>
                <a
                  href={orgData?.registry_form_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-all"
                  title="Open Link"
                >
                  <FaExternalLinkAlt />
                </a>
              </div>

              <div className="bg-neutral-900/50 rounded-lg p-3 border border-neutral-800">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-500 uppercase font-semibold">
                    Status
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="font-medium text-white">
                    Accepting Responses
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-neutral-900/30 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-500 mb-1 uppercase tracking-wider font-semibold">
                  Form URL
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                  <p className="text-sm text-neutral-300 truncate font-mono opacity-80">
                    {orgData?.registry_form_url}
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(orgData?.registry_form_url || "", "form")
                }
                className="p-2.5 hover:bg-neutral-700 rounded-lg transition-all text-neutral-400 hover:text-white border border-transparent hover:border-neutral-600"
                title="Copy URL"
              >
                {copiedField === "form" ? (
                  <FaCheck className="text-green-500" />
                ) : (
                  <FaCopy />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
