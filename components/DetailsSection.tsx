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
} from "react-icons/fi";
import { MdWork, MdVerified, MdPerson, MdGroup } from "react-icons/md";
import { BiArrowBack } from "react-icons/bi";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Member } from "@/app/(root)/page";

interface DetailsSectionProps {
  member: Member | null;
}

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
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for older browsers or non-HTTPS contexts
        fallbackCopyTextToClipboard(text);
      }
    } catch (err) {
      console.error("Failed to copy text: ", err);
      // Try fallback method if modern API fails
      fallbackCopyTextToClipboard(text);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
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
      } else {
        console.error("Fallback: Copy command failed");
      }
    } catch (err) {
      console.error("Fallback: Unable to copy", err);
    }

    document.body.removeChild(textArea);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span
        className={`${
          canCopy ? "cursor-pointer hover:text-blue-400 transition-colors" : ""
        } ${className}`}
      >
        {displayText}
      </span>
      {canCopy && showIcon && (
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-neutral-600/50 rounded transition-colors group"
          title="Copy to clipboard"
        >
          {copied ? (
            <FiCheck className="w-3 h-3 text-green-400" />
          ) : (
            <FiCopy className="w-3 h-3 text-gray-400 group-hover:text-gray-200" />
          )}
        </button>
      )}
    </div>
  );
};

const DetailsSection: React.FC<DetailsSectionProps> = ({ member }) => {
  const [isEditing, setIsEditing] = useState(false);

  if (!member) {
    return (
      <div className="flex-1 p-10 hidden md:block  bg-neutral-800/30">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="mb-8 p-6 bg-neutral-700/50 rounded-full">
            <Image
              src="/logo1.png"
              alt="Logo"
              width={80}
              height={80}
              className="opacity-60"
            />
          </div>
          <h2 className="text-white text-2xl font-semibold mb-3">
            Select a Member
          </h2>
          <p className="text-neutral-400 text-base max-w-md">
            Choose a member from the list to view their detailed information,
            edit profile, and manage settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 hidden md:block bg-neutral-800/30 overflow-y-auto">
      <motion.div
        key={member.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header with Actions */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-white text-2xl font-bold">Member Profile</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <FiEdit3 className="w-4 h-4 text-white" />
            </button>
            <button className="p-3 bg-neutral-700 hover:bg-neutral-600 rounded-xl transition-all duration-200 hover:scale-105">
              <FiMoreHorizontal className="w-4 h-4 text-gray-300" />
            </button>
          </div>
        </div>

        {/* Profile Header */}
        <div className="bg-gradient-to-br from-neutral-700/50 to-neutral-800/50 rounded-2xl p-8 mb-6 border border-neutral-600/30">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-1 border border-blue-500/30">
                <Image
                  src="/iron rank1.png"
                  width={108}
                  height={108}
                  alt={`${member.name} profile picture`}
                  className="rounded-2xl object-cover w-full h-full"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-neutral-700 flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-white text-3xl font-bold capitalize">
                  {member.name}
                </h2>
                <MdVerified className="w-6 h-6 text-blue-400" />
              </div>

              <div className="flex items-center gap-4 mb-4">
                <span className="text-gray-400 text-sm">ID: {member.id}</span>
                <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                <span className="text-gray-400 text-sm capitalize">
                  {member.sex || "Not specified"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-green-600/20 text-green-400 rounded-full text-sm font-semibold flex items-center gap-2 border border-green-500/30">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Active Member
                </div>
                <div className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-full text-sm font-semibold capitalize">
                  {member.role || "Member"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="bg-neutral-700/40 rounded-xl p-6 border border-neutral-600/30">
            <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <FiUser className="w-5 h-5 text-blue-400" />
              </div>
              Contact Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-neutral-600/30">
                <div className="flex items-center gap-3">
                  <FiMail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 font-medium">Email</span>
                </div>
                <CopyableText
                  text={member.email || ""}
                  className="text-white text-sm font-mono"
                />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-neutral-600/30">
                <div className="flex items-center gap-3">
                  <FiPhone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 font-medium">Phone</span>
                </div>
                <CopyableText
                  text={member.number || ""}
                  className="text-white text-sm font-mono"
                />
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <FiHome className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 font-medium">Address</span>
                </div>
                <CopyableText
                  text={member.houseAddress || ""}
                  className="text-white text-sm text-right max-w-48 truncate"
                />
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-neutral-700/40 rounded-xl p-6 border border-neutral-600/30">
            <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <MdPerson className="w-5 h-5 text-purple-400" />
              </div>
              Personal Info
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-neutral-600/30">
                <div className="flex items-center gap-3">
                  <FiCalendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 font-medium">Birthday</span>
                </div>
                <CopyableText
                  text={member.birthDay || ""}
                  className="text-white text-sm"
                  fallback="Not provided"
                />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-neutral-600/30">
                <div className="flex items-center gap-3">
                  <MdPerson className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 font-medium">Gender</span>
                </div>
                <CopyableText
                  text={member.sex || ""}
                  className="text-white text-sm capitalize"
                  fallback="Not specified"
                />
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <MdWork className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 font-medium">Role</span>
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
          <div className="bg-neutral-700/40 rounded-xl p-6 border border-neutral-600/30">
            <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <MdGroup className="w-5 h-5 text-green-400" />
              </div>
              Guardian Details
            </h3>
            <div className="space-y-4">
              <div className="py-3 border-b border-neutral-600/30">
                <div className="flex items-center gap-3 mb-3">
                  <FiUser className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 font-medium">
                    Male Guardian
                  </span>
                </div>
                <div className="ml-7 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Name</span>
                    <CopyableText
                      text={member.maleGName || ""}
                      className="text-white text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Phone</span>
                    <CopyableText
                      text={member.maleGNum || ""}
                      className="text-white text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
              <div className="py-3">
                <div className="flex items-center gap-3 mb-3">
                  <FiUser className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 font-medium">
                    Female Guardian
                  </span>
                </div>
                <div className="ml-7 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Name</span>
                    <CopyableText
                      text={member.femaleGName || ""}
                      className="text-white text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Phone</span>
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
          <div className="bg-neutral-700/40 rounded-xl p-6 border border-neutral-600/30">
            <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <MdWork className="w-5 h-5 text-orange-400" />
              </div>
              Ministry Info
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-neutral-600/30">
                <div className="flex items-center gap-3">
                  <MdGroup className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 font-medium">Team</span>
                </div>
                <CopyableText
                  text={member.team ? `${member.team} Team` : ""}
                  className="text-white text-sm capitalize"
                  fallback="No team assigned"
                />
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <MdWork className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 font-medium">Position</span>
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
    </div>
  );
};

export const DetailsSectionMobile: React.FC<DetailsSectionProps> = ({
  member,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  if (!member) {
    return (
      <div className="flex-1 p-10 bg-neutral-800/30 h-screen">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="mb-8 p-6 bg-neutral-700/50 rounded-full">
            <Image
              src="/logo1.png"
              alt="Logo"
              width={80}
              height={80}
              className="opacity-60"
            />
          </div>
          <h2 className="text-white text-2xl font-semibold mb-3">
            No member selected
          </h2>
          <p className="text-neutral-400 text-base max-w-md">
            Choose a member from the members page to view their detailed
            information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      key={member.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-1 pb-12 px-4 bg-neutral-800/50 h-full overflow-y-auto"
    >
      {/* Header */}
      <div className="flex justify-between -mx-4 items-center px-4 py-4 mb-6 bg-neutral-800/80 sticky top-0 z-10">
        <button
          onClick={() => redirect("/")}
          className="p-2 bg-neutral-700 hover:bg-neutral-600 rounded-xl transition-colors"
        >
          <BiArrowBack className="w-5 h-5 text-gray-300" />
        </button>
        <h1 className="text-white text-lg font-bold">Member Profile</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
        >
          <FiEdit3 className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Profile Header */}
      <div className="bg-gradient-to-br from-neutral-700/50 to-neutral-800/50 rounded-2xl p-6 mb-6 border border-neutral-600/30">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-1">
              <Image
                src="/iron rank1.png"
                width={76}
                height={76}
                alt={`${member.name} profile picture`}
                className="rounded-xl object-cover w-full h-full"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-neutral-700"></div>
          </div>

          <div className="flex-1">
            <h2 className="text-white text-xl font-bold capitalize mb-1">
              {member.name}
            </h2>
            <p className="text-gray-400 text-sm mb-2">ID: {member.id}</p>
            <div className="flex gap-2">
              <div className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs font-medium">
                Active
              </div>
              <div className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-medium capitalize">
                {member.role || "Member"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Information Sections */}
      <div className="space-y-6">
        {/* Contact Information */}
        <div className="bg-neutral-700/40 rounded-xl p-5 border border-neutral-600/30">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <FiUser className="w-4 h-4 text-blue-400" />
            Contact Details
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Email</span>
              <CopyableText
                text={member.email || ""}
                className="text-white text-sm text-right max-w-40 truncate"
                showIcon={false}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Phone</span>
              <CopyableText
                text={member.number || ""}
                className="text-white text-sm"
                showIcon={false}
              />
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-300 text-sm">Address</span>
              <CopyableText
                text={member.houseAddress || ""}
                className="text-white text-sm text-right max-w-40"
                showIcon={false}
              />
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-neutral-700/40 rounded-xl p-5 border border-neutral-600/30">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <MdPerson className="w-4 h-4 text-purple-400" />
            Personal Info
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Birthday</span>
              <CopyableText
                text={member.birthDay || ""}
                className="text-white text-sm"
                showIcon={false}
                fallback="Not provided"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Gender</span>
              <CopyableText
                text={member.sex || ""}
                className="text-white text-sm capitalize"
                showIcon={false}
                fallback="Not specified"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Team</span>
              <CopyableText
                text={member.team ? `${member.team} Team` : ""}
                className="text-white text-sm capitalize"
                showIcon={false}
                fallback="No team"
              />
            </div>
          </div>
        </div>

        {/* Guardian Information */}
        <div className="bg-neutral-700/40 rounded-xl p-5 border border-neutral-600/30">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <MdGroup className="w-4 h-4 text-green-400" />
            Guardian Details
          </h3>
          <div className="space-y-4">
            <div className="border-b border-neutral-600/30 pb-3">
              <span className="text-gray-300 text-sm font-medium block mb-3">
                Male Guardian
              </span>
              <div className="space-y-2 ml-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs">Name</span>
                  <CopyableText
                    text={member.maleGName || ""}
                    className="text-white text-sm text-right max-w-32 truncate"
                    showIcon={false}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs">Phone</span>
                  <CopyableText
                    text={member.maleGNum || ""}
                    className="text-white text-sm font-mono"
                    showIcon={false}
                  />
                </div>
              </div>
            </div>
            <div>
              <span className="text-gray-300 text-sm font-medium block mb-3">
                Female Guardian
              </span>
              <div className="space-y-2 ml-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs">Name</span>
                  <CopyableText
                    text={member.femaleGName || ""}
                    className="text-white text-sm text-right max-w-32 truncate"
                    showIcon={false}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs">Phone</span>
                  <CopyableText
                    text={member.femaleGNum || ""}
                    className="text-white text-sm font-mono"
                    showIcon={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </motion.div>
    
  );
};

export default DetailsSection;
