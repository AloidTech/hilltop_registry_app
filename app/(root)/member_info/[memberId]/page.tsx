"use client";
import React, { useEffect, useState } from "react";
import { DetailsSectionMobile } from "@/components/DetailsSection";
import { useParams } from "next/navigation";
import { Member } from "@/app/(root)/page";

function MemberInfo() {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    async function fetchMembers() {
      setLoading(true);
      try {
        const response = await fetch("/api/members", {
          next: { revalidate: 60 },
        });
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setMembers(data.members);
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

  const { memberId } = useParams();
  const selectedMember = members.filter((member) => member.id === memberId);

  return (
    <div className=" h-screen">
      <DetailsSectionMobile member={selectedMember[0]} />
    </div>
  );
}

export default MemberInfo;
