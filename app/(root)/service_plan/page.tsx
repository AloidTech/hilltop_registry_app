"use client";
import React from "react";
import { useState } from "react";
import {
  FiEdit3,
  FiPhone,
  FiMail,
  FiUser,
  FiCalendar,
  FiMapPin,
  FiSettings,
  FiMoreHorizontal,
  FiTrash2,
} from "react-icons/fi";
import { MdWork, MdVerified, MdLocationOn } from "react-icons/md";
import { BiTime, BiDollarCircle, BiCopy, BiArrowBack } from "react-icons/bi";
import { redirect } from "next/navigation";

interface ServicePlanProp {
  TimePeriod: String;
  Program: String;
  Anchors: Array<String>;
}
[];

interface ServicePlansProps {
  ServicePlanProp: Array<ServicePlanProp>;
}
[];

var servicePlanDates: any = [];


const ServicePlans = {
  "last Week": [
    {
      TimePeriod: "7:00am - 7:05am",
      Program: "Opening Prayer",
      Anchors: ["Tiffany", "Zane"],
    },
    {
      TimePeriod: "7:05am - 7:10am",
      Program: "Thanks Giving",
      Anchors: ["Tiffany"],
    },
    {
      TimePeriod: "7:10am- 7:20am",
      Program: "Closing Prayer",
      Anchors: ["Tiffany"],
    },
  ],

  "Two Weeks ago": [
    {
      TimePeriod: "7:00am - 7:05am",
      Program: "Opening Prayer",
      Anchors: ["Tiffany", "Zane"],
    },
    {
      TimePeriod: "7:05am - 7:10am",
      Program: "Thanks Giving",
      Anchors: ["Tiffany"],
    },
    {
      TimePeriod: "7:10am- 7:20am",
      Program: "Closing Prayer",
      Anchors: ["Tiffany"],
    },
  ],
};
for (const date in ServicePlans) {
  servicePlanDates.push(date);
}

function ServicePlanPage() {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <div className="flex-1 pb-6 px-6 bg-neutral-800/50 h-screen overflow-y-auto">
      {/* Header with Actions */}
      <div className="flex justify-between -mx-6 items-center px-6 py-3.5 mb-6 ">
        <h1 className="text-white text-xl font-semibold">Plan Of Serivice</h1>
      </div>
      {/* Information Cards */}
      <div className="w-screen gap-4 mb-6">
        {/* Contact Information */}
        <div className="bg-neutral-700/50 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <FiUser className="w-4 h-4" />
            Previous Plans
          </h3>
          <div className="space-y-3">
            {servicePlanDates.map((planDate: string) => (
              <div key={planDate} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FiCalendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 text-sm">{planDate}</span>
                </div>
                <span className="text-white text-sm">.</span>
              </div>
            ))}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MdLocationOn className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">Location</span>
              </div>
              <span className="text-white text-sm">Abuja, Nigeria</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServicePlanPage;
