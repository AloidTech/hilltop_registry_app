import React, { useState } from "react";
import Image from "next/image";
import { Member } from "@/app/(root)/page";
import {
  FiEdit3,
  FiPhone,
  FiMail,
  FiUser,
  FiMoreHorizontal,
} from "react-icons/fi";
import { MdWork, MdVerified, MdLocationOn } from "react-icons/md";
import { BiArrowBack } from "react-icons/bi";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";

interface DetailsSectionProps {
  member: Member | null;
}

const DetailsSection: React.FC<DetailsSectionProps> = ({ member }) => {
  const [isEditing, setIsEditing] = useState(false);

  if (!member) {
    return (
      <div className="flex-1 p-10 hidden md:block bg-neutral-800/30">
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header with Actions */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-white text-xl font-semibold">Member Details</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <FiEdit3 className="w-4 h-4 text-white" />
            </button>
            <button className="p-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors">
              <FiMoreHorizontal className="w-4 h-4 text-gray-300" />
            </button>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-neutral-700/50 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-neutral-600 p-1">
                <Image
                  src="/iron rank1.png"
                  width={88}
                  height={88}
                  alt={`${member.name} profile picture`}
                  className="rounded-full object-cover w-full h-full"
                />
              </div>
              {/* Online Status */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-neutral-700"></div>
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-white text-2xl font-bold capitalize">
                  {member.name}
                </h2>
                <MdVerified className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-gray-300 text-sm mb-3">ID: {member.id}</p>

              {/* Status Badge */}
              <div className="flex items-center gap-2 mb-4">
                <div className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Active
                </div>
                <div className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium capitalize">
                  {member.role ?? "member"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Contact Information */}
          <div className="bg-neutral-700/50 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <FiUser className="w-4 h-4" />
              Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FiPhone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 text-sm">Phone</span>
                </div>
                <span className="text-white text-sm">
                  {member.number ?? member.parentNum ?? "-----"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FiMail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 text-sm">Email</span>
                </div>
                <span className="text-white text-sm">
                  {member.email || "Not provided"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MdLocationOn className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 text-sm">Location</span>
                </div>
                <span className="text-white text-sm">Abuja, Nigeria</span>
              </div>
            </div>
          </div>

          {/* Work Information */}
          <div className="bg-neutral-700/50 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <MdWork className="w-4 h-4" />
              Work Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FiUser className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 text-sm">Role</span>
                </div>
                <span className="text-white text-sm capitalize">
                  {member.role}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MdWork className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 text-sm">Team</span>
                </div>
                <span className="text-white text-sm capitalize">
                  {member.team ? `${member.team} Team` : "none"}
                </span>
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
      <div className="flex-1 p-10 bg-neutral-800/30">
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
    <motion.div
      key={member.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex-1 pb-6 px-6 bg-neutral-800/50 h-full overflow-y-auto"
    >
      {/* Header with Actions */}
      <div className="flex justify-between -mx-6 items-center px-6 py-3 mb-6 bg-neutral-800/80">
        <button
          onClick={() => redirect("/")}
          className="p-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
        >
          <BiArrowBack className="w-4 h-4 text-gray-300" />
        </button>
        <h1 className="text-white text-xl font-semibold">Member Details</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <FiEdit3 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-neutral-700/50 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-neutral-600 p-1">
              <Image
                src="/iron rank1.png"
                width={88}
                height={88}
                alt={`${member.name} profile picture`}
                className="rounded-full object-cover w-full h-full"
              />
            </div>
            {/* Online Status */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-neutral-700"></div>
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-white text-2xl font-bold capitalize">
                {member.name}
              </h2>
              <MdVerified className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-gray-300 text-sm mb-3">ID: {member.id}</p>

            {/* Status Badge */}
            <div className="flex items-center gap-2 mb-4">
              <div className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm font-medium flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Active
              </div>
              <div className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium capitalize">
                {member.role}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Contact Information */}
        <div className="bg-neutral-700/50 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <FiUser className="w-4 h-4" />
            Contact Information
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiPhone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">Phone</span>
              </div>
              <span className="text-white text-sm">{member.number}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiMail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">Email</span>
              </div>
              <span className="text-white text-sm">
                {member.email || "Not provided"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MdLocationOn className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">Location</span>
              </div>
              <span className="text-white text-sm">Abuja, Nigeria</span>
            </div>
          </div>
        </div>

        {/* Work Information */}
        <div className="bg-neutral-700/50 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <MdWork className="w-4 h-4" />
            Work Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiUser className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">Role</span>
              </div>
              <span className="text-white text-sm capitalize">
                {member.role}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MdWork className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">Team</span>
              </div>
              <span className="text-white text-sm capitalize">
                {member.team} Team
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DetailsSection;
