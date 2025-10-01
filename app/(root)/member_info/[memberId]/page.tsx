"use client";
import React from "react";
import { DetailsSectionMobile } from "@/components/DetailsSection";
import { useParams } from "next/navigation";

const Members = [
  {
    id: "212",
    name: "zane Chidiebere",
    number: "234+8161843341",
    email: "zanealoid@gmail.com",
    role: "worker",
    team: "tech",
  },
  {
    id: "213",
    name: "Bera Chidiebere",
    number: "234+8161843341",
    email: "zanealoid@gmail.com",
    role: "worker",
    team: "tech",
  },
  {
    id: "211",
    name: "adriel Chidiebere",
    number: "234+8161843341",
    email: "zanealoid@gmail.com",
    role: "worker",
    team: "tech",
  },
];

function MemberInfo() {
  const { memberId } = useParams();
  const selectedMember = Members.filter((member) => member.id === memberId);

  return (
    <div className=" h-screen">
      <DetailsSectionMobile member={selectedMember[0]} />
    </div>
  );
}

export default MemberInfo;
