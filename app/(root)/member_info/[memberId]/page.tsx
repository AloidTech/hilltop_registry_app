"use client";
import React, { useEffect, useState } from "react";
import { DetailsSectionMobile } from "@/components/DetailsSection";
import { useParams } from "next/navigation";
import { Member } from "@/app/(root)/page";
import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";

function MemberInfo() {
  const [loading, setLoading] = useState(true); // Start with loading = true
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const { memberId } = useParams();
  useEffect(() => {
    async function fetchMembers() {
      try {
        const response = await fetch("/api/members", {
          next: { revalidate: 60 },
        });
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          // Updated to use data.data for server cache compatibility
          const membersData = data.data || data.members || [];
          setMembers(membersData);

          // Find the selected member
          const foundMember = membersData.find(
            (member: Member) => member.id === memberId
          );
          setSelectedMember(foundMember || null);
        }
      } catch (error) {
        console.error("Failed to fetch members:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, [memberId]);

  return (
    <div className="h-screen bg-neutral-800">
      {loading ? (
        <div className="relative h-full">
          {/* Ring Loading Spinner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center pt-60 justify-start space-y-4 z-10"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <FaSpinner className="w-8 h-8 text-blue-500" />
            </motion.div>
            <p className="text-gray-400 text-lg">Loading member details...</p>
          </motion.div>

          {/* Skeleton for Member Details */}
          <div className="opacity-40">
            {/* Navbar Skeleton */}
            <div className="flex justify-between items-center p-4 border-b border-neutral-600/50">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-neutral-600/50 rounded-lg animate-pulse"></div>
                <div className="h-5 bg-neutral-600/50 rounded animate-pulse w-32"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-neutral-600/50 rounded-lg animate-pulse"></div>
                <div className="h-8 w-8 bg-neutral-600/50 rounded-lg animate-pulse"></div>
              </div>
            </div>

            {/* Member Details Content Skeleton */}
            <div className="p-6 space-y-6">
              {/* Header skeleton */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-neutral-600/50 rounded-full animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-neutral-600/50 rounded animate-pulse w-32"></div>
                  <div className="h-4 bg-neutral-600/30 rounded animate-pulse w-24"></div>
                </div>
              </div>

              {/* Details skeleton */}
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 bg-neutral-700/30 rounded-lg"
                  >
                    <div className="h-4 bg-neutral-600/50 rounded animate-pulse w-20"></div>
                    <div className="h-4 bg-neutral-600/30 rounded animate-pulse w-32"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <DetailsSectionMobile member={selectedMember} />
      )}
    </div>
  );
}

export default MemberInfo;
