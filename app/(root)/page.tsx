"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BiSearch, BiFilter } from "react-icons/bi";
import { FaUserPlus, FaUser, FaUsers } from "react-icons/fa";

import { useAuth } from "@/lib/ClientAuth";
import { useOrgStore } from "@/lib/store";
import { OrgSelectionModal } from "@/components/OrgSelectionModal";
import DetailsSection, { DetailsSectionMobile } from "@/components/DetailsSection";

// --- Types ---

export interface Member {
  id: string;
  name: string;
  number?: string;
  maleGNum?: string;
  maleGName: string;
  femaleGName: string;
  femaleGNum?: string;
  houseAddress: string;
  birthDay: string;
  email?: string;
  sex?: string;
  role?: string;
  team?: string;
  // Extra fields for details
  occupation?: string;
  maritalStatus?: string;
}

// --- Page Transitions ---
const slideTransition = {
  initial: { x: "100%", opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: "100%", opacity: 0 },
  transition: { type: "spring" as const, stiffness: 300, damping: 30 },
};

// --- Components ---

const MemberListItem = ({
  member,
  selected,
  onClick,
}: {
  member: Member;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center p-4 gap-4 border-b border-[var(--border-secondary)] transition-all ${
      selected
        ? "bg-[var(--bg-card)] border-l-4 border-l-indigo-500"
        : "hover:bg-[var(--bg-card)]/50 border-l-4 border-l-transparent"
    }`}
  >
    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-lg ${
        selected
          ? "bg-indigo-600/20 text-indigo-400 ring-2 ring-indigo-500/30"
          : "bg-[var(--bg-card)] text-neutral-400"
      }`}
    >
      {member.name.charAt(0).toUpperCase()}
    </div>
    <div className="flex-1 text-left">
      <h3
        className={`font-medium ${selected ? "text-white" : "text-neutral-300"}`}
      >
        {member.name}
      </h3>
      <p className="text-sm text-neutral-500 truncate">
        {member.role || "Member"} • {member.team || "No Team"}
      </p>
    </div>
    <div className="text-neutral-600">
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </div>
  </button>
);

const MemberSkeleton = () => (
  <div className="p-4 flex items-center gap-4 border-b border-[var(--border-secondary)] animate-pulse">
    <div className="w-12 h-12 bg-[var(--bg-card)] rounded-full skeleton-shimmer" />
    <div className="flex-1 space-y-2">
      <div className="w-1/3 h-4 bg-[var(--bg-card)] rounded skeleton-shimmer" />
      <div className="w-1/2 h-3 bg-[var(--bg-elevated)] rounded skeleton-shimmer" />
    </div>
  </div>
);

export default function MembersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { selectedOrg } = useOrgStore();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showOrgModal, setShowOrgModal] = useState(false);

  // --- Effects ---

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user && !selectedOrg) {
      setShowOrgModal(true);
    }
  }, [user, selectedOrg]);

  useEffect(() => {
    if (selectedOrg) {
      fetchMembers();
      setShowOrgModal(false);
    }
  }, [selectedOrg]);

  const fetchMembers = async () => {
    if (!selectedOrg) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/members?org_id=${selectedOrg.id}`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.data || data.members || []);
      }
    } catch (error) {
      console.error("Failed to fetch members", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.role?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // --- Render ---

  if (authLoading) {
    return (
      <div className="flex bg-[var(--bg-primary)] min-h-screen">
        {/* Skeleton List */}
        <div className="w-full lg:w-[450px] shrink-0 border-r border-[var(--border-primary)] h-screen">
          <div className="p-6 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
            <div className="h-8 w-32 skeleton-shimmer rounded-lg mb-6" />
            <div className="h-12 w-full skeleton-shimmer rounded-xl" />
          </div>
          <div className="flex-1">
            {Array(6).fill(0).map((_, i) => <MemberSkeleton key={i} />)}
          </div>
        </div>
        {/* Skeleton Details */}
        <div className="hidden lg:flex flex-1 bg-[var(--bg-secondary)] items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 skeleton-shimmer rounded-full mx-auto mb-6" />
            <div className="h-6 w-40 skeleton-shimmer rounded mx-auto mb-2" />
            <div className="h-4 w-56 skeleton-shimmer rounded mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[var(--bg-primary)] min-h-screen">
      <OrgSelectionModal
        isOpen={showOrgModal}
        onClose={() => selectedOrg && setShowOrgModal(false)}
      />

      {/* List Sidebar */}
      <div
        className={`
        flex-col border-r border-[var(--border-primary)] bg-[var(--bg-primary)] h-screen overflow-hidden
        ${selectedMember ? "hidden lg:flex" : "flex"}
        w-full lg:w-[450px] shrink-0
      `}
      >
        {/* Header */}
        <div className="p-6 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] backdrop-blur-sm sticky top-0 z-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <FaUsers className="text-indigo-500" />
              Members
              <span className="text-sm font-normal text-neutral-500 bg-[var(--bg-card)] px-2.5 py-0.5 rounded-full border border-[var(--border-primary)]">
                {members.length}
              </span>
            </h1>
            <button
              onClick={() => router.push("/workers/signup")}
              className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-colors shadow-lg shadow-indigo-500/20"
            >
              <FaUserPlus size={18} />
            </button>
          </div>

          {/* Search */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-indigo-500 transition-colors">
              <BiSearch size={20} />
            </div>
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg-card)] border border-[var(--border-primary)] text-neutral-200 text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-neutral-600"
            />
            <div className="absolute inset-y-0 right-3 flex items-center">
              <button className="p-1.5 text-neutral-500 hover:text-white rounded-lg hover:bg-[var(--bg-elevated)] transition-colors">
                <BiFilter size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Member List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            Array(5)
              .fill(0)
              .map((_, i) => <MemberSkeleton key={i} />)
          ) : filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <MemberListItem
                key={member.id}
                member={member}
                selected={selectedMember?.id === member.id}
                onClick={() => setSelectedMember(member)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-neutral-500 text-center px-6">
              <div className="w-16 h-16 bg-[var(--bg-card)] rounded-full flex items-center justify-center mb-4 border border-[var(--border-primary)]">
                <FaUser className="text-neutral-600 text-2xl" />
              </div>
              <p className="font-medium mb-1">No members found</p>
              <p className="text-sm">Try adjusting your search filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Details View */}
      <div className="hidden lg:flex flex-1 bg-[var(--bg-secondary)] h-screen overflow-hidden relative items-center justify-center">
        <AnimatePresence mode="wait">
          {selectedMember ? (
            <motion.div
              key={selectedMember.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full h-full"
            >
              <DetailsSection
                member={selectedMember}
                onClose={() => setSelectedMember(null)}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-neutral-600 flex flex-col items-center"
            >
              <div className="w-24 h-24 bg-[var(--bg-card)] rounded-full flex items-center justify-center mb-6 ring-1 ring-[var(--border-primary)]">
                <FaUser className="text-4xl text-neutral-700" />
              </div>
              <h2 className="text-xl font-medium text-neutral-400 mb-2">
                Select a member
              </h2>
              <p className="text-neutral-600 max-w-xs">
                Click on a member from the list to view their detailed profile.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Details Slide-over */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            {...slideTransition}
            className="fixed inset-0 z-50 lg:hidden bg-[var(--bg-primary)] flex flex-col"
          >
            <DetailsSectionMobile
              member={selectedMember}
              onClose={() => setSelectedMember(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
