"use client";
import Image from "next/image";
import { BiCalendarEvent, BiFilterAlt, BiSearch } from "react-icons/bi";
import { FaFilter, FaUserPlus, FaSpinner } from "react-icons/fa";
import DetailsSection from "@/components/DetailsSection";
import { useState } from "react";
import { useEffect } from "react";
import { NavBarDeskt, NavBarMobile } from "@/components/NavBar";
import { redirect } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export interface Member {
  id: string;
  name: string;
  number: string;
  parentNum: string;
  email?: string;
  role: string;
  team?: string;
}

export default function Home() {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [Members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    async function fetchMembers() {
      setLoading(true);
      try {
        // Add a small delay to show loading animation
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const response = await fetch("/api/members");
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setMembers(data.members);
          setFilteredMembers(data.members);
        }
      } catch (error) {
        console.error("Failed to fetch members:", error);
        // Keep using fallback data
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, []);

  function filterSearch(param: string) {
    if (param.length == 0) {
      setFilteredMembers(Members);
    } else {
      const filtered = Members.filter((member) =>
        member.name.toLowerCase().includes(param.toLowerCase())
      );
      setFilteredMembers(filtered);
    }
  }

  return (
    <div className="z-0 md:flex font-sans bg-neutral-800">
      <div className="flex h-screen w-full bg-[rgb(45,46,45)] justify-between md:rounded-tl-md">
        {/* First Section */}
        <div className="flex-col justify-start w-full md:w-1/3 md:border-r-1 p-5 border-[rgb(32,33,32)]">
          {/* Header */}
          <header className="flex justify-between items-center w-full h-8 mb-3">
            <div className="text-xl">Members</div>
            {/* Header Icons */}
            <div className="flex gap-2">
              <button className="rounded-full p-2 hover:bg-neutral-700">
                <FaUserPlus className="w-5 h-5" />
              </button>
              <button className="rounded-full p-2 hover:bg-neutral-700">
                <BiFilterAlt className="w-5 h-5" />
              </button>
            </div>
          </header>
          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <BiSearch className="text-gray-400 w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search members"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                filterSearch(e.target.value);
              }}
              className="
                flex text-sm pl-10  p-3 gap-2 border-b-1 border-neutral-400 
                items-center rounded-md h-8 w-full bg-[rgb(61,62,61)]
                focus:outline-0 focus:border-b-3 focus:bg-neutral-800 focus:border-green-600
                "
            />
          </div>
          {/* Member Item Mobile*/}
          <div className="md:hidden -mx-2.5 flex-2 overflow-y-auto space-y-2">
            {filteredMembers.map((member) => (
              <button
                onClick={() => {
                  setSelectedMember(member);
                  redirect(`/member_info/${member.id}`);
                }}
                key={member.id}
                className="flex gap-4 h-18 px-2 py-1 items-center rounded-md focus:bg-neutral-700 hover:bg-neutral-700 mb-0.5 w-full"
              >
                <div className="flex h-12 w-12 rounded-4xl bg-neutral-900 justify-center items-center">
                  {/* Profile Image */}
                  <Image
                    src={"/iron rank1.png"}
                    width={40}
                    height={40}
                    alt="Profile Picture"
                    className="rounded-4xl"
                  />
                </div>

                {/* Member Info */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between">
                    <h3 className="text-white font-medium truncate capitalize">
                      {member.name}
                    </h3>
                    <h3 className="text-gray-300 text-sm truncate">
                      {member.number ?? member.parentNum ?? "-----"}
                    </h3>
                  </div>

                  <p className="text-gray-400 text-sm truncate">
                    {member.role ?? "member"} - {member.team ?? "none"}
                  </p>
                </div>
              </button>
            ))}
          </div>
          {/* Desktop Member list */}
          <div className="hidden md:block flex-2 -mx-2.5 overflow-y-auto space-y-2">
            {filteredMembers.map((member) => (
              <button
                onClick={() => setSelectedMember(member)}
                key={member.id}
                className="flex gap-4 h-18 px-2 py-1 items-center rounded-md focus:bg-neutral-700 hover:bg-neutral-700 mb-0.5 w-full"
              >
                <div className="flex h-12 w-12 rounded-4xl bg-neutral-900 justify-center items-center">
                  {/* Profile Image */}
                  <Image
                    src={"/iron rank1.png"}
                    width={40}
                    height={40}
                    alt="Profile Picture"
                    className="rounded-4xl"
                  />
                </div>

                {/* Member Info */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between">
                    <h3 className="text-white font-medium truncate capitalize">
                      {member.name}
                    </h3>
                    <h3 className="text-gray-300 text-sm truncate">
                      {member.number ?? member.parentNum ?? "-----"}
                    </h3>
                  </div>

                  <p className="text-gray-400 text-sm truncate">
                    {member.role ?? "member"} - {member.team ?? "none"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
        {/* Second Section */}
        <DetailsSection member={selectedMember} />
      </div>
    </div>
  );
}
