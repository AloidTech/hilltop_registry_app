"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaBuilding,
  FaSearch,
  FaPlus,
  FaCog,
  FaFileAlt,
  FaUsers,
  FaClock,
  FaChevronLeft,
  FaArrowLeft,
  FaPen,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/ClientAuth";
import { useOrgStore } from "@/lib/store";
import { fetchUserOrgs } from "@/lib/organisation_utils";

// --- Types ---
interface Org {
  id: string;
  name: string;
  role: string;
  registry_sheet?: {
    name?: string;
    url: string;
    form_url: string;
  };
  member_count?: number;
  recent_activity?: number;
}

// --- Components ---

// Slide transition matching members page
const slideTransition = {
  initial: { x: "100%", opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: "100%", opacity: 0 },
  transition: { type: "spring" as const, stiffness: 300, damping: 30 },
};

const OrgListItem = ({
  org,
  selected,
  onSelect,
  onViewDetails,
}: {
  org: Org;
  selected: boolean;
  onSelect: () => void;
  onViewDetails: () => void;
}) => {
  const [isSliding, setIsSliding] = useState(false);
  // Random delay offsets for arrow and text floating animations
  const [arrowDelay] = useState(() => Math.random() * 2);
  const [textDelay] = useState(() => Math.random() * 2);

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSliding(true);
  };

  return (
    <div
      className={`w-full text-left border-b border-[var(--border-secondary)] transition-all relative overflow-hidden ${
        selected
          ? "bg-green-500/5 border-l-4 border-l-green-500"
          : "hover:bg-[var(--bg-card)]/50 border-l-4 border-l-transparent"
      }`}
    >
      {/* Main org info - clickable to select */}
      <motion.div
        onClick={onSelect}
        whileHover="hover"
        className="flex items-start gap-4 p-4 pr-0 cursor-pointer group"
      >
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-colors ${
            selected
              ? "bg-green-500/10 text-green-400"
              : "bg-[var(--bg-card)] text-neutral-500 group-hover:text-green-500/70"
          }`}
        >
          <FaBuilding />
        </div>
        <div className="flex-1 min-h-[56px] flex flex-col justify-between">
          <motion.h3
            variants={{
              hover: {
                textShadow: [
                  "0 0 0px #22c55e",
                  "0 0 8px #22c55e",
                  "0 0 0px #22c55e",
                ],
                transition: { duration: 1, repeat: Infinity },
              },
            }}
            className="font-semibold transition-colors text-neutral-300 group-hover:text-white"
          >
            {org.name}
          </motion.h3>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium w-fit ${
              org.role === "Owner"
                ? "bg-green-500/20 text-green-400"
                : "bg-blue-500/20 text-blue-400"
            }`}
          >
            {org.role}
          </span>
        </div>
      </motion.div>

      {/* Slide-out details panel - separate div for click handling */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ x: "100%", width: "30%" }}
            animate={{
              x: 0,
              width: isSliding ? "100%" : "30%",
            }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            onAnimationComplete={() => {
              if (isSliding) {
                onViewDetails();
                setIsSliding(false);
              }
            }}
            onClick={handleDetailsClick}
            whileHover={
              !isSliding ? { backgroundColor: "rgba(64, 64, 64, 1)" } : {}
            }
            whileTap={!isSliding ? { scale: 0.98 } : {}}
            className="absolute right-0 top-0 h-full bg-neutral-800/90 flex items-center justify-center gap-4 text-neutral-400 hover:text-white transition-colors border-l border-neutral-700 cursor-pointer"
          >
            <motion.span
              animate={{ y: [0, -4, 0, 4, 0] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: arrowDelay,
              }}
            >
              <FaChevronLeft className="text-sm" />
            </motion.span>
            <motion.span
              animate={{ y: [0, -4, 0, 4, 0] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: textDelay,
              }}
              className="text-xs font-medium"
            >
              Details
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const OrgDetails = ({
  org,
  onClose,
  refresh,
}: {
  org: Org;
  onClose: () => void;
  refresh: () => void;
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    sheet_name: org.registry_sheet?.name || "",
    sheet_url: org.registry_sheet?.url || "",
    form_url: org.registry_sheet?.form_url || "", // Note: This might need to map to top-level registry_form_url based on DB schema
  });
  const [loading, setLoading] = useState(false);

  // Stats (Mocked or real if available)
  const memberCount = org.member_count ?? "--";
  const recentActivity = org.recent_activity ?? "--";

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/organisation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: org.id,
          user_id: user.uid,
          updates: {
            registry_sheet: {
              name: formData.sheet_name,
              url: formData.sheet_url,
            },
            registry_form_url: formData.form_url,
          },
        }),
      });
      if (res.ok) {
        setIsEditing(false);
        refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--bg-secondary)] overflow-y-auto custom-scrollbar">
      {/* Detail Header */}
      <div className="sticky top-0 z-20 bg-[var(--bg-card)]/90 backdrop-blur-xl border-b border-[var(--border-primary)] p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="lg:hidden p-2 -ml-2 text-neutral-400 hover:text-white"
          >
            <FaArrowLeft />
          </button>
          <div className="w-10 h-10 rounded-lg bg-green-900/20 text-green-500 flex items-center justify-center border border-green-500/20">
            <FaBuilding />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">
              {org.name}
            </h2>
            <p className="text-xs text-neutral-500">Organization Settings</p>
          </div>
        </div>
        <button className="px-3 py-1.5 rounded-lg bg-[var(--bg-card)] text-neutral-300 text-xs font-medium hover:bg-[var(--bg-card-hover)] border border-[var(--border-primary)]">
          Export Data
        </button>
      </div>

      <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto w-full">
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] p-5 rounded-2xl flex flex-col">
            <div className="flex items-center gap-2 text-indigo-400 mb-2">
              <FaUsers />{" "}
              <span className="text-xs uppercase font-bold tracking-wider">
                Members
              </span>
            </div>
            <span className="text-3xl font-bold text-white">{memberCount}</span>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] p-5 rounded-2xl flex flex-col">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <FaClock />{" "}
              <span className="text-xs uppercase font-bold tracking-wider">
                Recent Activity
              </span>
            </div>
            <span className="text-3xl font-bold text-white">
              {recentActivity}
            </span>
            <span className="text-xs text-neutral-500 mt-1">
              Updates this week
            </span>
          </div>
        </div>

        {/* Configuration Section */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[var(--border-secondary)] flex items-center justify-between bg-[var(--bg-card)]">
            <div className="flex items-center gap-2 text-neutral-300 font-semibold">
              <FaCog className="text-neutral-500" /> Registry Configuration
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 text-green-500 hover:text-green-400 text-sm font-medium px-3 py-1 rounded-lg hover:bg-green-500/10 transition-colors"
              >
                <FaPen size={12} /> Edit
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 text-neutral-400 hover:text-white transition-colors"
                >
                  <FaTimes />
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 bg-green-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <FaCog className="animate-spin" />
                  ) : (
                    <FaSave size={12} />
                  )}{" "}
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="p-6 space-y-6">
            {/* Sheet Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                Sheet Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.sheet_name}
                  onChange={(e) =>
                    setFormData({ ...formData, sheet_name: e.target.value })
                  }
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
                  placeholder="Enter Google Sheet Name"
                />
              ) : (
                <div className="flex items-center gap-3 text-white bg-neutral-950 p-3 rounded-lg border border-neutral-800/50">
                  <FaFileAlt className="text-green-600" />
                  {org.registry_sheet?.name || "Not Configured"}
                </div>
              )}
            </div>

            {/* Sheet URL */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                Google Sheet URL
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.sheet_url}
                  onChange={(e) =>
                    setFormData({ ...formData, sheet_url: e.target.value })
                  }
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none font-mono text-sm"
                  placeholder="https://docs.google.com/spreadsheets/..."
                />
              ) : (
                <div className="flex items-center gap-3 text-neutral-400 bg-neutral-950 p-3 rounded-lg border border-neutral-800/50 overflow-hidden">
                  <span className="truncate font-mono text-sm">
                    {org.registry_sheet?.url || "Not Configured"}
                  </span>
                </div>
              )}
            </div>

            {/* Form URL */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                Registration Form URL
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.form_url}
                  onChange={(e) =>
                    setFormData({ ...formData, form_url: e.target.value })
                  }
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none font-mono text-sm"
                  placeholder="https://forms.gle/..."
                />
              ) : (
                <div className="flex items-center gap-3 text-neutral-400 bg-neutral-950 p-3 rounded-lg border border-neutral-800/50 overflow-hidden">
                  <span className="truncate font-mono text-sm">
                    {org.registry_sheet?.form_url || "Not Configured"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function OrganisationPage() {
  const { user, loading: authLoading } = useAuth();
  const { selectedOrg, setSelectedOrg } = useOrgStore();
  const router = useRouter();

  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Local state for UI selection (syncs with store but local for independent nav)
  const [localSelectedOrg, setLocalSelectedOrg] = useState<Org | null>(null);

  // Separate state for viewing details (doesn't affect which org is "active")
  const [viewingOrg, setViewingOrg] = useState<Org | null>(null);

  // Sync Global Store with Local State
  useEffect(() => {
    if (selectedOrg && !localSelectedOrg) {
      // find full org object from list if needed, but for now just use what we have
      // Actually, we should wait until orgs are loaded to map it
    }
  }, [selectedOrg, localSelectedOrg]);

  const loadOrgs = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchUserOrgs(user);
      if (data) {
        // Transform data to match Org interface if needed
        const mappedOrgs = data.map(
          (o: {
            id: string;
            name: string;
            user_id: string;
            registry_sheet: { name: string; url: string };
            registry_form_url: string;
            member_count?: number;
            recent_activity?: string;
          }) => ({
            id: o.id,
            name: o.name,
            role: o.user_id === user.uid ? "Owner" : "Member",
            registry_sheet: {
              ...o.registry_sheet,
              form_url: o.registry_form_url,
            },
            member_count: o.member_count,
            recent_activity: o.recent_activity,
          }),
        );
        setOrgs(mappedOrgs);
        if (selectedOrg) {
          const found = mappedOrgs.find((o: Org) => o.id === selectedOrg.id);
          if (found) setLocalSelectedOrg(found);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push("/auth/login");
      else loadOrgs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  const handleSelect = (org: Org) => {
    setLocalSelectedOrg(org);
    setSelectedOrg(org); // Sync global store
  };

  const handleViewDetails = (org: Org) => {
    setViewingOrg(org);
  };

  const filteredOrgs = orgs.filter((o) =>
    o.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Skeleton
  const ListSkeleton = () => (
    <div className="p-4 border-b border-[var(--border-secondary)] animate-pulse flex gap-4">
      <div className="w-12 h-12 bg-[var(--bg-card)] rounded-xl skeleton-shimmer" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-4 bg-[var(--bg-card)] rounded w-1/3 skeleton-shimmer" />
        <div className="h-3 bg-[var(--bg-elevated)] rounded w-1/4 skeleton-shimmer" />
      </div>
    </div>
  );

  // Show skeleton while auth is loading
  if (authLoading) {
    return (
      <div className="flex bg-[var(--bg-primary)] min-h-screen">
        <div className="w-full lg:w-[450px] shrink-0 border-r border-[var(--border-primary)] h-screen">
          <div className="p-6 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
            <div className="h-8 w-40 skeleton-shimmer rounded-lg mb-6" />
            <div className="h-12 w-full skeleton-shimmer rounded-xl" />
          </div>
          <div className="flex-1">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <ListSkeleton key={i} />
              ))}
          </div>
        </div>
        <div className="hidden lg:flex flex-1 bg-[var(--bg-secondary)] items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 skeleton-shimmer rounded-full mx-auto mb-6" />
            <div className="h-6 w-48 skeleton-shimmer rounded mx-auto mb-2" />
            <div className="h-4 w-56 skeleton-shimmer rounded mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[var(--bg-primary)] min-h-screen">
      {/* Sidebar List */}
      <div
        className={`
         flex-col border-r border-[var(--border-primary)] bg-[var(--bg-primary)] h-screen overflow-hidden
         ${viewingOrg ? "hidden lg:flex" : "flex"}
         w-full lg:w-[450px] shrink-0
      `}
      >
        <div className="p-6 bg-neutral-700/30 backdrop-blur-sm border-b border-neutral-600/50 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <FaBuilding className="text-green-500" />
              Organisations
            </h1>
            <button
              onClick={() => router.push("/organisation/create")}
              className="w-10 h-10 rounded-full bg-green-600 hover:bg-green-500 text-white flex items-center justify-center transition-colors shadow-lg shadow-green-900/20"
            >
              <FaPlus />
            </button>
          </div>
        </div>
        <div className="mt-6 p-6 bg-[(var(--bg-primary)] backdrop-blur-sm">
          <div className="relative">
            <FaSearch className="absolute left-4 top-3.5 text-neutral-500" />
            <input
              type="text"
              placeholder="Search "
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl py-3 pl-10 text-neutral-200 focus:border-green-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            Array(4)
              .fill(0)
              .map((_, i) => <ListSkeleton key={i} />)
          ) : filteredOrgs.length > 0 ? (
            filteredOrgs.map((org) => (
              <OrgListItem
                key={org.id}
                org={org}
                selected={localSelectedOrg?.id === org.id}
                onSelect={() => handleSelect(org)}
                onViewDetails={() => handleViewDetails(org)}
              />
            ))
          ) : (
            <div className="p-8 text-center text-neutral-500 flex flex-col items-center">
              <div className="w-16 h-16 bg-[var(--bg-card)] rounded-full flex items-center justify-center mb-4 border border-[var(--border-primary)]">
                <FaBuilding className="text-2xl text-neutral-600" />
              </div>
              <p>No organizations found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Details */}
      <div className="hidden lg:flex flex-1 bg-[var(--bg-secondary)] h-screen overflow-hidden relative items-center justify-center">
        <AnimatePresence mode="wait">
          {viewingOrg ? (
            <motion.div
              key={viewingOrg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full h-full"
            >
              <OrgDetails
                org={viewingOrg}
                onClose={() => setViewingOrg(null)}
                refresh={loadOrgs}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-neutral-600 flex flex-col items-center"
            >
              <div className="w-24 h-24 bg-[var(--bg-card)] rounded-full flex items-center justify-center mb-6 ring-1 ring-[var(--border-primary)]">
                <FaBuilding className="text-4xl text-neutral-700" />
              </div>
              <h2 className="text-xl font-medium text-neutral-400 mb-2">
                Select an Organisation
              </h2>
              <p className="text-neutral-600 max-w-xs">
                Click the arrow on an organisation to view details
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Details Slide-Over */}
      <AnimatePresence>
        {viewingOrg && (
          <motion.div
            {...slideTransition}
            className="fixed inset-0 z-50 lg:hidden bg-[var(--bg-primary)] flex flex-col"
          >
            <OrgDetails
              org={viewingOrg}
              onClose={() => setViewingOrg(null)}
              refresh={loadOrgs}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
