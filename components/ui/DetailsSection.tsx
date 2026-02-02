"use client";

import React, { useState } from "react";
import {
  FiEdit3,
  FiPhone,
  FiMail,
  FiUser,
  FiMoreHorizontal,
  FiCalendar,
  FiHome,
  FiCopy,
  FiCheck,
  FiArrowLeft,
} from "react-icons/fi";
import { MdWork, MdVerified, MdPerson, MdGroup } from "react-icons/md";
import { motion } from "framer-motion";
import Image from "next/image";
import { Member } from "@/app/(root)/page";

interface DetailsSectionProps {
  member: Member | null;
  onClose?: () => void;
}

// Skeleton Loading Component
const DetailsSkeleton = () => (
  <div className="flex-1 p-6 lg:p-10 bg-[var(--bg-secondary)] h-full overflow-y-auto">
    {/* Header Skeleton */}
    <div className="flex justify-between items-center mb-6">
      <div className="h-8 w-40 skeleton-shimmer rounded-lg" />
      <div className="flex gap-2">
        <div className="w-11 h-11 skeleton-shimmer rounded-xl" />
        <div className="w-11 h-11 skeleton-shimmer rounded-xl" />
      </div>
    </div>

    {/* Profile Card Skeleton */}
    <div className="bg-[var(--bg-card)] rounded-2xl p-8 mb-6 border border-[var(--border-primary)]">
      <div className="flex items-start gap-6">
        <div className="w-28 h-28 skeleton-shimmer rounded-2xl" />
        <div className="flex-1 space-y-4">
          <div className="h-8 w-48 skeleton-shimmer rounded-lg" />
          <div className="flex gap-3">
            <div className="h-5 w-24 skeleton-shimmer rounded" />
            <div className="h-5 w-20 skeleton-shimmer rounded" />
          </div>
          <div className="flex gap-3">
            <div className="h-8 w-28 skeleton-shimmer rounded-full" />
            <div className="h-8 w-20 skeleton-shimmer rounded-full" />
          </div>
        </div>
      </div>
    </div>

    {/* Info Grid Skeleton */}
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-primary)]"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 skeleton-shimmer rounded-lg" />
            <div className="h-5 w-32 skeleton-shimmer rounded" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex justify-between py-3">
                <div className="h-4 w-20 skeleton-shimmer rounded" />
                <div className="h-4 w-32 skeleton-shimmer rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Mobile Skeleton
const MobileDetailsSkeleton = () => (
  <div className="flex-1 pb-12 px-4 bg-[var(--bg-secondary)] h-full overflow-y-auto">
    {/* Header */}
    <div className="flex justify-between items-center px-4 py-4 mb-6 bg-[var(--bg-card)] -mx-4 sticky top-0 z-10">
      <div className="w-10 h-10 skeleton-shimmer rounded-xl" />
      <div className="h-5 w-32 skeleton-shimmer rounded" />
      <div className="w-10 h-10 skeleton-shimmer rounded-xl" />
    </div>

    {/* Profile Card */}
    <div className="bg-[var(--bg-card)] rounded-2xl p-6 mb-6 border border-[var(--border-primary)]">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-20 h-20 skeleton-shimmer rounded-xl" />
        <div className="flex-1 space-y-3">
          <div className="h-6 w-36 skeleton-shimmer rounded" />
          <div className="h-4 w-24 skeleton-shimmer rounded" />
          <div className="flex gap-2">
            <div className="h-6 w-16 skeleton-shimmer rounded-full" />
            <div className="h-6 w-20 skeleton-shimmer rounded-full" />
          </div>
        </div>
      </div>
    </div>

    {/* Info Sections */}
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-[var(--bg-card)] rounded-xl p-5 border border-[var(--border-primary)]"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 skeleton-shimmer rounded" />
            <div className="h-5 w-28 skeleton-shimmer rounded" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex justify-between">
                <div className="h-4 w-16 skeleton-shimmer rounded" />
                <div className="h-4 w-28 skeleton-shimmer rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Reusable CopyableText component
const CopyableText: React.FC<{
  text: string;
  fallback?: string;
  className?: string;
  showIcon?: boolean;
}> = ({ text, fallback = "Not provided", className = "", showIcon = true }) => {
  const [copied, setCopied] = useState(false);

  const displayText = text || fallback;
  const canCopy = text && text !== fallback;

  const handleCopy = async () => {
    if (!canCopy) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        fallbackCopyTextToClipboard(text);
      }
    } catch (err) {
      console.error("Failed to copy text: ", err);
      fallbackCopyTextToClipboard(text);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Fallback: Unable to copy", err);
    }

    document.body.removeChild(textArea);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span
        className={`${canCopy ? "cursor-pointer hover:text-indigo-400 transition-colors" : ""} ${className}`}
      >
        {displayText}
      </span>
      {canCopy && showIcon && (
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-neutral-700/50 rounded transition-colors group"
          title="Copy to clipboard"
        >
          {copied ? (
            <FiCheck className="w-3 h-3 text-green-400" />
          ) : (
            <FiCopy className="w-3 h-3 text-neutral-500 group-hover:text-neutral-300" />
          )}
        </button>
      )}
    </div>
  );
};

// Page Transition Animation (matching settings page)
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { type: "spring" as const, stiffness: 300, damping: 30 },
};

// --- Desktop Details Section ---
const DetailsSection: React.FC<DetailsSectionProps> = ({ member }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading] = useState(false);

  if (isLoading) {
    return <DetailsSkeleton />;
  }

  if (!member) {
    return (
      <div className="flex-1 p-10 flex items-center justify-center bg-[var(--bg-secondary)] h-full">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 p-6 bg-[var(--bg-card)] rounded-full border border-[var(--border-primary)]">
            <FiUser className="w-16 h-16 text-neutral-600" />
          </div>
          <h2 className="text-white text-2xl font-semibold mb-3">
            Select a Member
          </h2>
          <p className="text-neutral-500 text-base max-w-md">
            Choose a member from the list to view their detailed information,
            edit profile, and manage settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      key={member.id}
      {...pageTransition}
      className="flex-1 p-6 lg:p-10 bg-[var(--bg-secondary)] overflow-y-auto h-full custom-scrollbar"
    >
      {/* Header with Actions */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-white text-2xl font-bold">Member Profile</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all duration-200 hover:scale-105"
          >
            <FiEdit3 className="w-4 h-4 text-white" />
          </button>
          <button className="p-3 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-primary)] rounded-xl transition-all duration-200 hover:scale-105">
            <FiMoreHorizontal className="w-4 h-4 text-neutral-400" />
          </button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-elevated)] rounded-2xl p-8 mb-6 border border-[var(--border-primary)]">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-1 border border-indigo-500/30">
              <Image
                src="/iron rank1.png"
                width={108}
                height={108}
                alt={`${member.name} profile picture`}
                className="rounded-2xl object-cover w-full h-full"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-[var(--bg-card)] flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-white text-3xl font-bold capitalize">
                {member.name}
              </h2>
              <MdVerified className="w-6 h-6 text-indigo-400" />
            </div>

            <div className="flex items-center gap-4 mb-4">
              <span className="text-neutral-500 text-sm">ID: {member.id}</span>
              <div className="w-1 h-1 bg-neutral-600 rounded-full"></div>
              <span className="text-neutral-500 text-sm capitalize">
                {member.sex || "Not specified"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-green-600/20 text-green-400 rounded-full text-sm font-semibold flex items-center gap-2 border border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Active Member
              </div>
              <div className="px-4 py-2 bg-indigo-600/20 text-indigo-400 rounded-full text-sm font-semibold capitalize border border-indigo-500/30">
                {member.role || "Member"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Information Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-primary)]">
          <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <FiUser className="w-5 h-5 text-indigo-400" />
            </div>
            Contact Details
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-[var(--border-secondary)]">
              <div className="flex items-center gap-3">
                <FiMail className="w-4 h-4 text-neutral-500" />
                <span className="text-neutral-400 font-medium">Email</span>
              </div>
              <CopyableText
                text={member.email || ""}
                className="text-white text-sm font-mono"
              />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[var(--border-secondary)]">
              <div className="flex items-center gap-3">
                <FiPhone className="w-4 h-4 text-neutral-500" />
                <span className="text-neutral-400 font-medium">Phone</span>
              </div>
              <CopyableText
                text={member.number || ""}
                className="text-white text-sm font-mono"
              />
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <FiHome className="w-4 h-4 text-neutral-500" />
                <span className="text-neutral-400 font-medium">Address</span>
              </div>
              <CopyableText
                text={member.houseAddress || ""}
                className="text-white text-sm text-right max-w-48 truncate"
              />
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-primary)]">
          <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <MdPerson className="w-5 h-5 text-purple-400" />
            </div>
            Personal Info
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-[var(--border-secondary)]">
              <div className="flex items-center gap-3">
                <FiCalendar className="w-4 h-4 text-neutral-500" />
                <span className="text-neutral-400 font-medium">Birthday</span>
              </div>
              <CopyableText
                text={member.birthDay || ""}
                className="text-white text-sm"
                fallback="Not provided"
              />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[var(--border-secondary)]">
              <div className="flex items-center gap-3">
                <MdPerson className="w-4 h-4 text-neutral-500" />
                <span className="text-neutral-400 font-medium">Gender</span>
              </div>
              <CopyableText
                text={member.sex || ""}
                className="text-white text-sm capitalize"
                fallback="Not specified"
              />
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <MdWork className="w-4 h-4 text-neutral-500" />
                <span className="text-neutral-400 font-medium">Role</span>
              </div>
              <CopyableText
                text={member.role || ""}
                className="text-white text-sm capitalize"
                fallback="Member"
              />
            </div>
          </div>
        </div>

        {/* Guardian Information */}
        <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-primary)]">
          <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <MdGroup className="w-5 h-5 text-green-400" />
            </div>
            Guardian Details
          </h3>
          <div className="space-y-4">
            <div className="py-3 border-b border-[var(--border-secondary)]">
              <div className="flex items-center gap-3 mb-3">
                <FiUser className="w-4 h-4 text-neutral-500" />
                <span className="text-neutral-400 font-medium">
                  Male Guardian
                </span>
              </div>
              <div className="ml-7 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 text-sm">Name</span>
                  <CopyableText
                    text={member.maleGName || ""}
                    className="text-white text-sm"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 text-sm">Phone</span>
                  <CopyableText
                    text={member.maleGNum || ""}
                    className="text-white text-sm font-mono"
                  />
                </div>
              </div>
            </div>
            <div className="py-3">
              <div className="flex items-center gap-3 mb-3">
                <FiUser className="w-4 h-4 text-neutral-500" />
                <span className="text-neutral-400 font-medium">
                  Female Guardian
                </span>
              </div>
              <div className="ml-7 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 text-sm">Name</span>
                  <CopyableText
                    text={member.femaleGName || ""}
                    className="text-white text-sm"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 text-sm">Phone</span>
                  <CopyableText
                    text={member.femaleGNum || ""}
                    className="text-white text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ministry Information */}
        <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-primary)]">
          <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <MdWork className="w-5 h-5 text-amber-400" />
            </div>
            Ministry Info
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-[var(--border-secondary)]">
              <div className="flex items-center gap-3">
                <MdGroup className="w-4 h-4 text-neutral-500" />
                <span className="text-neutral-400 font-medium">Team</span>
              </div>
              <CopyableText
                text={member.team ? `${member.team} Team` : ""}
                className="text-white text-sm capitalize"
                fallback="No team assigned"
              />
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <MdWork className="w-4 h-4 text-neutral-500" />
                <span className="text-neutral-400 font-medium">Position</span>
              </div>
              <CopyableText
                text={member.role || ""}
                className="text-white text-sm capitalize"
                fallback="Member"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Mobile Details Section ---
export const DetailsSectionMobile: React.FC<DetailsSectionProps> = ({
  member,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  if (!member) {
    return <MobileDetailsSkeleton />;
  }

  return (
    <motion.div
      key={member.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 pb-24 px-4 bg-[var(--bg-secondary)] h-full overflow-y-auto custom-scrollbar"
    >
      {/* Header */}
      <div className="flex justify-between -mx-4 items-center px-4 py-4 mb-6 bg-[var(--bg-card)]/90 sticky top-0 z-10 backdrop-blur-xl border-b border-[var(--border-primary)]">
        <button
          onClick={() => onClose?.()}
          className="p-2.5 bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-primary)] rounded-xl transition-colors"
        >
          <FiArrowLeft className="w-5 h-5 text-neutral-400" />
        </button>
        <h1 className="text-white text-lg font-bold">Member Profile</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors"
        >
          <FiEdit3 className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-elevated)] rounded-2xl p-6 mb-6 border border-[var(--border-primary)]"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-1 border border-indigo-500/30">
              <Image
                src="/iron rank1.png"
                width={76}
                height={76}
                alt={`${member.name} profile picture`}
                className="rounded-xl object-cover w-full h-full"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-[var(--bg-card)]"></div>
          </div>

          <div className="flex-1">
            <h2 className="text-white text-xl font-bold capitalize mb-1">
              {member.name}
            </h2>
            <p className="text-neutral-500 text-sm mb-2">ID: {member.id}</p>
            <div className="flex gap-2">
              <div className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs font-medium border border-green-500/30">
                Active
              </div>
              <div className="px-3 py-1 bg-indigo-600/20 text-indigo-400 rounded-full text-xs font-medium capitalize border border-indigo-500/30">
                {member.role || "Member"}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Information Sections */}
      <div className="space-y-4">
        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-[var(--bg-card)] rounded-xl p-5 border border-[var(--border-primary)]"
        >
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <FiUser className="w-4 h-4 text-indigo-400" />
            Contact Details
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-400 text-sm">Email</span>
              <CopyableText
                text={member.email || ""}
                className="text-white text-sm text-right max-w-40 truncate"
                showIcon={false}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400 text-sm">Phone</span>
              <CopyableText
                text={member.number || ""}
                className="text-white text-sm"
                showIcon={false}
              />
            </div>
            <div className="flex justify-between items-start">
              <span className="text-neutral-400 text-sm">Address</span>
              <CopyableText
                text={member.houseAddress || ""}
                className="text-white text-sm text-right max-w-40"
                showIcon={false}
              />
            </div>
          </div>
        </motion.div>

        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[var(--bg-card)] rounded-xl p-5 border border-[var(--border-primary)]"
        >
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <MdPerson className="w-4 h-4 text-purple-400" />
            Personal Info
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-400 text-sm">Birthday</span>
              <CopyableText
                text={member.birthDay || ""}
                className="text-white text-sm"
                showIcon={false}
                fallback="Not provided"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400 text-sm">Gender</span>
              <CopyableText
                text={member.sex || ""}
                className="text-white text-sm capitalize"
                showIcon={false}
                fallback="Not specified"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400 text-sm">Team</span>
              <CopyableText
                text={member.team ? `${member.team} Team` : ""}
                className="text-white text-sm capitalize"
                showIcon={false}
                fallback="No team"
              />
            </div>
          </div>
        </motion.div>

        {/* Guardian Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-[var(--bg-card)] rounded-xl p-5 border border-[var(--border-primary)]"
        >
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <MdGroup className="w-4 h-4 text-green-400" />
            Guardian Details
          </h3>
          <div className="space-y-4">
            <div className="border-b border-[var(--border-secondary)] pb-3">
              <span className="text-neutral-400 text-sm font-medium block mb-3">
                Male Guardian
              </span>
              <div className="space-y-2 ml-2">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500 text-xs">Name</span>
                  <CopyableText
                    text={member.maleGName || ""}
                    className="text-white text-sm text-right max-w-32 truncate"
                    showIcon={false}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500 text-xs">Phone</span>
                  <CopyableText
                    text={member.maleGNum || ""}
                    className="text-white text-sm font-mono"
                    showIcon={false}
                  />
                </div>
              </div>
            </div>
            <div>
              <span className="text-neutral-400 text-sm font-medium block mb-3">
                Female Guardian
              </span>
              <div className="space-y-2 ml-2">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500 text-xs">Name</span>
                  <CopyableText
                    text={member.femaleGName || ""}
                    className="text-white text-sm text-right max-w-32 truncate"
                    showIcon={false}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500 text-xs">Phone</span>
                  <CopyableText
                    text={member.femaleGNum || ""}
                    className="text-white text-sm font-mono"
                    showIcon={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DetailsSection;
