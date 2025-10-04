"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsClock,
  BsCalendarCheck,
  BsPlus,
  BsThreeDotsVertical,
} from "react-icons/bs";
import { FiUser, FiCalendar, FiEdit3, FiEye, FiDownload } from "react-icons/fi";
import { MdLocationOn, MdExpandMore, MdExpandLess } from "react-icons/md";

interface ServicePlanProp {
  TimePeriod: string;
  Program: string;
  Anchors: Array<string>;
}

interface ServicePlanData {
  [key: string]: ServicePlanProp[];
}

const ServicePlans: ServicePlanData = {
  "Last Sunday (Dec 15, 2024)": [
    {
      TimePeriod: "7:00am - 7:05am",
      Program: "Opening Prayer",
      Anchors: ["Tiffany", "Zane"],
    },
    {
      TimePeriod: "7:05am - 7:15am",
      Program: "Praise & Worship",
      Anchors: ["David", "Sarah"],
    },
    {
      TimePeriod: "7:15am - 7:25am",
      Program: "Thanksgiving",
      Anchors: ["Tiffany"],
    },
    {
      TimePeriod: "7:25am - 8:00am",
      Program: "Word of God",
      Anchors: ["Pastor John"],
    },
    {
      TimePeriod: "8:00am - 8:05am",
      Program: "Closing Prayer",
      Anchors: ["Elder Mark"],
    },
  ],
  "Previous Sunday (Dec 8, 2024)": [
    {
      TimePeriod: "7:00am - 7:05am",
      Program: "Opening Prayer",
      Anchors: ["Michael", "Grace"],
    },
    {
      TimePeriod: "7:05am - 7:15am",
      Program: "Praise & Worship",
      Anchors: ["Ruth", "Samuel"],
    },
    {
      TimePeriod: "7:15am - 7:25am",
      Program: "Thanksgiving",
      Anchors: ["Mary"],
    },
    {
      TimePeriod: "7:25am - 8:00am",
      Program: "Word of God",
      Anchors: ["Pastor James"],
    },
    {
      TimePeriod: "8:00am - 8:05am",
      Program: "Closing Prayer",
      Anchors: ["Deacon Paul"],
    },
  ],
  "Dec 1, 2024": [
    {
      TimePeriod: "7:00am - 7:05am",
      Program: "Opening Prayer",
      Anchors: ["Peter", "Esther"],
    },
    {
      TimePeriod: "7:05am - 7:15am",
      Program: "Praise & Worship",
      Anchors: ["Hannah", "Joshua"],
    },
    {
      TimePeriod: "7:15am - 7:25am",
      Program: "Thanksgiving",
      Anchors: ["Rebecca"],
    },
    {
      TimePeriod: "7:25am - 8:00am",
      Program: "Word of God",
      Anchors: ["Pastor Matthew"],
    },
    {
      TimePeriod: "8:00am - 8:05am",
      Program: "Closing Prayer",
      Anchors: ["Elder Luke"],
    },
  ],
};

const servicePlanDates = Object.keys(ServicePlans);

function ServicePlanPage() {
  const [isAtBottom, setIsAtBotttom] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsAtBotttom(entry.isIntersecting);
        if (entry.isIntersecting) {
          console.log();
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: "0px 0px -50px 0px", // Trigger 50px before actual bottom
      }
    );
    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }
    return () => observer.disconnect();
  }, []);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(
    servicePlanDates[0]
  );
  const [selectedPlan, setSelectedPlan] = useState<string>(servicePlanDates[0]);

  const toggleExpanded = (planDate: string) => {
    setExpandedPlan(expandedPlan === planDate ? null : planDate);
  };

  const getStatusColor = (index: number) => {
    if (index === 0)
      return "bg-green-500/20 text-green-400 border-green-500/30";
    if (index === 1) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const getStatusText = (index: number) => {
    if (index === 0) return "Latest";
    if (index === 1) return "Recent";
    return "Archived";
  };

  return (
    <div className="flex-1 pb-6 px-6 bg-neutral-800/50 h-screen overflow-y-auto">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between -mx-6 items-center px-6 py-4 mb-6 bg-neutral-700/30 backdrop-blur-sm border-b border-neutral-600/50"
      >
        <div>
          <h1 className="text-white text-2xl font-bold">Service Plans</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage and view worship service schedules
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700  text-white rounded-lg transition-colors"
          >
            <BsPlus className="w-8 h-8 md:w-4 md:h-4" />
            <div className="md:block hidden"> New Plan</div>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-neutral-600 hover:bg-neutral-500 text-white rounded-lg transition-colors"
          >
            <BsThreeDotsVertical className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <div className="bg-neutral-700/50 rounded-xl p-4 border border-neutral-600/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Plans</p>
              <p className="text-white text-2xl font-bold">
                {servicePlanDates.length}
              </p>
            </div>
            <BsCalendarCheck className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-neutral-700/50 rounded-xl p-4 border border-neutral-600/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Programs</p>
              <p className="text-white text-2xl font-bold">5</p>
            </div>
            <BsClock className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-neutral-700/50 rounded-xl p-4 border border-neutral-600/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Location</p>
              <p className="text-white text-lg font-semibold">Abuja</p>
            </div>
            <MdLocationOn className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </motion.div>

      {/* Service Plans List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            <FiUser className="w-5 h-5" />
            Service Plans History
          </h3>
          <button className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
            <FiDownload className="w-4 h-4" />
            Export All
          </button>
        </div>

        {servicePlanDates.map((planDate, index) => (
          <motion.div
            key={planDate}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-neutral-700/50 rounded-xl border border-neutral-600/50 overflow-hidden"
          >
            {/* Plan Header */}
            <div
              onClick={() => toggleExpanded(planDate)}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-600/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <FiCalendar className="w-5 h-5 text-gray-400" />
                <div>
                  <h4 className="text-white font-medium">{planDate}</h4>
                  <p className="text-gray-400 text-sm">
                    {ServicePlans[planDate].length} programs scheduled
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Status Badge */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    index
                  )}`}
                >
                  {getStatusText(index)}
                </span>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 hover:bg-neutral-600 rounded-lg transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan(planDate);
                    }}
                  >
                    <FiEye className="w-4 h-4 text-gray-400" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 hover:bg-neutral-600 rounded-lg transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FiEdit3 className="w-4 h-4 text-gray-400" />
                  </motion.button>
                </div>

                {/* Expand Icon */}
                <motion.div
                  animate={{ rotate: expandedPlan === planDate ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <MdExpandMore className="w-5 h-5 text-gray-400" />
                </motion.div>
              </div>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
              {expandedPlan === planDate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-neutral-600/50"
                >
                  <div className="p-4 bg-neutral-800/30">
                    <div className="space-y-3">
                      {ServicePlans[planDate].map((program, programIndex) => (
                        <motion.div
                          key={programIndex}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: programIndex * 0.05 }}
                          className="flex items-center justify-between p-3 bg-neutral-700/30 rounded-lg hover:bg-neutral-600/30 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-blue-400 font-mono text-sm min-w-[120px]">
                              <BsClock className="w-4 h-4" />
                              {program.TimePeriod}
                            </div>
                            <div>
                              <h5 className="text-white font-medium">
                                {program.Program}
                              </h5>
                              <div className="flex items-center gap-2 mt-1">
                                <FiUser className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-400 text-sm">
                                  {program.Anchors.join(", ")}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-1">
                            {program.Anchors.map((anchor, anchorIndex) => (
                              <div
                                key={anchorIndex}
                                className="w-8 h-8 bg-neutral-600 rounded-full flex items-center justify-center text-white text-xs font-medium"
                              >
                                {anchor.charAt(0).toUpperCase()}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Summary */}
                    <div className="mt-4 pt-3 border-t border-neutral-600/50">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">
                          Total Duration: ~{ServicePlans[planDate].length * 10}{" "}
                          minutes
                        </span>
                        <span className="text-gray-400">
                          {
                            new Set(
                              ServicePlans[planDate].flatMap((p) => p.Anchors)
                            ).size
                          }{" "}
                          participants
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>
      <div ref={bottomRef} className="w-full h-4" />
      {isAtBottom ? (
        <div className="mt-10">-</div>
      ) : (
        <div className="mt-0">-</div>
      )}
    </div>
  );
}

export default ServicePlanPage;
