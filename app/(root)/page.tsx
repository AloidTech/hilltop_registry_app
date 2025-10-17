"use client";
import Image from "next/image";
import { BiFilterAlt, BiSearch } from "react-icons/bi";
import { FaUserPlus, FaSpinner } from "react-icons/fa";
import DetailsSection from "@/components/DetailsSection";
import { useState } from "react";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

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
}

export default function Home() {
  const router = useRouter();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [Members, setMembers] = useState<Member[]>([]);
  const [emptySearch, setEmptySearch] = useState(false);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const response = await fetch("/api/members", {
          next: { revalidate: 60 },
        });
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          const membersData = data.data || data.members || [];
          setMembers(membersData);
          setFilteredMembers(membersData);
        }
      } catch (error) {
        console.error("Failed to fetch members:", error);
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
      if (filtered.length == 0) {
        setEmptySearch(true);
      }
      setFilteredMembers(filtered);
      setEmptySearch(false);
    }
  }

  const handleMemberClick = (member: Member, type: string) => {
    if (type == "d") {
      // Desktop: Just set selected member for details panel
      setSelectedMember(member);
    } else if (type == "m") {
      // Mobile: Navigate to member info page
      setSelectedMember(member);
      router.push(`/member_info/${member.id}`);
    }
  };

  return (
    <div className="z-0 md:flex font-sans bg-[rgb(45,46,45)]">
      <div className="flex h-screen w-full justify-between md:rounded-tl-md">
        {/* First Section - Add flex column and height constraint */}
        <div className="flex flex-col w-full md:w-1/3 md:border-r-1 py-5 pl-3.5 pr-3 border-[rgb(32,33,32)]">
          {/* Header - Fixed */}
          <header className="flex-shrink-0 flex justify-between items-center w-full h-8 mb-3">
            <div className="text-xl">Members</div>

            {/* Header Icons */}
            <div className="flex gap-2">
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSeEg0bgljWJL1ayUC9hNQUqwDu5_96Aiag27_ZO0TGuZhQUrQ/viewform"
                className="rounded-full p-2 hover:bg-neutral-700"
              >
                <FaUserPlus className="w-5 h-5" />
              </a>
              <button className="rounded-full p-2 hover:bg-neutral-700">
                <BiFilterAlt className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Search Bar - Fixed */}
          <div className="flex-shrink-0 relative mb-4">
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

          {/* Member Lists Container - Scrollable */}
          <div className="flex-1 min-h-0">
            {/* Loading State */}
            {loading && (
              <div className="h-full relative">
                {/* Ring Loading Spinner */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center py-10 space-y-4 z-10"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <FaSpinner className="w-6 h-6 text-blue-500" />
                  </motion.div>
                  <p className="text-gray-400 text-sm">Loading members...</p>
                </motion.div>

                {/* Faded Skeleton Members List */}
                <div className="-mx-2.5 flex-2 overflow-hidden space-y-2 opacity-40">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div
                      key={i}
                      className="flex gap-4 h-18 px-2 py-1 items-center rounded-md mb-0.5 w-full"
                    >
                      <div className="h-12 w-12 rounded-full bg-neutral-600/50 animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-neutral-600/50 rounded animate-pulse w-3/4"></div>
                        <div className="h-3 bg-neutral-600/30 rounded animate-pulse w-1/2"></div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <div className="h-3 bg-neutral-600/40 rounded animate-pulse w-16"></div>
                        <div className="h-3 bg-neutral-600/30 rounded animate-pulse w-12"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Desktop Member list */}
            {!loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="hidden md:block pr-2 h-full -mx-2.5 overflow-y-auto space-y-2 slim-scrollbar"
                // ⬆️ Changed flex-1 to h-full
              >
                <AnimatePresence>
                  {filteredMembers &&
                    filteredMembers.map((member, index) => (
                      <motion.button
                        key={member.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleMemberClick(member, "d")}
                        className={`flex gap-4 h-18 px-2 py-1 items-center rounded-md mb-0.5 w-full transition-all duration-200 ${
                          selectedMember?.id === member.id
                            ? "bg-neutral-600"
                            : "hover:bg-neutral-700"
                        }`}
                      >
                        <div className="flex h-12 w-12 rounded-4xl bg-neutral-900 justify-center items-center">
                          <Image
                            src={"/iron rank1.png"}
                            width={40}
                            height={40}
                            alt="Profile Picture"
                            className="rounded-4xl"
                          />
                        </div>

                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex justify-between gap-4">
                            <h3 className="text-white font-medium truncate capitalize">
                              {member.name}
                            </h3>
                            <h3 className="text-gray-300 text-sm ">
                              {member.number ??
                                member.maleGNum ??
                                member.femaleGNum ??
                                "-----"}
                            </h3>
                          </div>
                          <p className="text-gray-400 text-sm truncate">
                            {member.role ?? "member"} - {member.team ?? "none"}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  {emptySearch ? <div>No Such Member</div> : <div></div>}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Mobile Member list */}
            {!loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="md:hidden h-full -mx-2.5 overflow-y-auto space-y-2"
                // ⬆️ Changed flex-1 to h-full
              >
                <AnimatePresence>
                  {filteredMembers &&
                    filteredMembers.map((member, index) => (
                      <motion.button
                        key={member.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleMemberClick(member, "m")}
                        className="flex gap-4 h-18 px-2 py-1 items-center rounded-md mb-0.5 w-full transition-all duration-200 focus:bg-neutral-700 hover:bg-neutral-700"
                      >
                        <div className="flex h-12 w-12 rounded-4xl bg-neutral-900 justify-center items-center">
                          <Image
                            src={"/iron rank1.png"}
                            width={40}
                            height={40}
                            alt="Profile Picture"
                            className="rounded-4xl"
                          />
                        </div>

                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex justify-between">
                            <h3 className="text-white font-medium truncate capitalize">
                              {member.name}
                            </h3>
                            <h3 className="text-gray-300 text-sm truncate">
                              {member.number ??
                                member.maleGNum ??
                                member.femaleGNum ??
                                "-----"}
                            </h3>
                          </div>
                          <p className="text-gray-400 text-sm truncate">
                            {member.role ?? "member"} - {member.team ?? "none"}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  {emptySearch ? (
                    <div className="text-white z-30 mx-20 font-medium truncate capitalize">
                      No Such Member
                    </div>
                  ) : (
                    <div></div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>

        {/* Second Section */}
        <DetailsSection member={selectedMember} />
      </div>
    </div>
  );
}
