"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsClock,
  BsCalendarCheck,
  BsPlus,
  BsThreeDotsVertical,
} from "react-icons/bs";
import { FiUser, FiCalendar, FiEdit3, FiDownload } from "react-icons/fi";
import { MdExpandMore } from "react-icons/md";

export interface ServicePlanProp {
  id: string;
  TimePeriod: string;
  Program: string;
  Anchors: Array<string>;
}

export interface ServicePlanData {
  [key: string]: ServicePlanProp[];
}

function ServicePlanPage() {
  const [plansLoading, setPlansLoading] = useState(true);
  const [ServicePlans, setServicePlans] = useState<ServicePlanData>({});
  const servicePlanDates = Object.keys(ServicePlans);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  useEffect(() => {
    const fetchServicePlans = async () => {
      try {
        const response = await fetch("/api/service_plan");
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched data:", data);
          setServicePlans(data.data || {}); // Fix: data.data not data[0]

          // Set first plan as expanded by default
          const dates = Object.keys(data.data || {});
          if (dates.length > 0) {
            setExpandedPlan(dates[0]);
          }
        } else {
          console.error("Failed to fetch service plans");
        }
      } catch (e) {
        console.error("Error fetching service plans:", e);
      } finally {
        setPlansLoading(false);
      }
    };

    fetchServicePlans();
  }, []);

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
    if (index === 1) return "Previous";
    return new Date(servicePlanDates[index]).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Calculate total programs across all plans
  const totalPrograms = Object.values(ServicePlans).reduce(
    (total, programs) => total + programs.length,
    0
  );

  // Calculate unique participants
  const allAnchors = Object.values(ServicePlans).flatMap((programs) =>
    programs.flatMap((p) => p.Anchors)
  );
  const uniqueParticipants = new Set(allAnchors).size;

  if (plansLoading) {
    return (
      <div className="flex-1 pb-28 px-6 bg-neutral-800/50 backdrop-blur-sm h-screen overflow-y-auto">
        {/* Header Skeleton */}
        <motion.div className="flex justify-between -mx-6 items-center px-8 py-4 mb-6 bg-neutral-700/30 backdrop-blur-sm border-b border-neutral-600/50">
          <div>
            <h1 className="text-white text-xl md:text-2xl font-bold">
              Service Plans
            </h1>
            <p className="text-gray-400 text-xs md:text-sm mt-1">
              Manage and view worship service schedules
            </p>
          </div>
          <div className="flex gap-2 md:gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <a
                href="/service_plan/add_service_plan"
                className="flex items-center gap-1 md:gap-2"
              >
                <BsPlus className="w-5 h-5 md:w-4 md:h-4" />
                <div className="hidden sm:block text-sm md:text-base">
                  New Plan
                </div>
              </a>
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

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-neutral-700/30 backdrop-blur-sm p-4 rounded-xl border border-neutral-600/50"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-neutral-600/50 rounded-lg animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-neutral-600/50 rounded animate-pulse w-20"></div>
                  <div className="h-6 bg-neutral-600/30 rounded animate-pulse w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Service Plan Cards Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-neutral-700/30 backdrop-blur-sm border border-neutral-600/50 rounded-xl overflow-hidden"
            >
              <div className="p-4 border-b border-neutral-600/50">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="h-5 bg-neutral-600/50 rounded animate-pulse w-32"></div>
                    <div className="h-4 bg-neutral-600/30 rounded animate-pulse w-24"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 bg-neutral-600/50 rounded-full animate-pulse w-16"></div>
                    <div className="h-8 w-8 bg-neutral-600/50 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="h-4 bg-neutral-600/50 rounded animate-pulse w-24"></div>
                      <div className="h-3 bg-neutral-600/30 rounded animate-pulse w-32"></div>
                    </div>
                    <div className="h-4 bg-neutral-600/30 rounded animate-pulse w-20"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 pb-28 px-6 bg-neutral-800/50 backdrop-blur-sm h-screen overflow-y-auto">
      {/* Enhanced Header */}
      <motion.div className="flex justify-between -mx-6 items-center px-8 py-4 mb-6 bg-neutral-700/30 backdrop-blur-sm border-b border-neutral-600/50">
        <div>
          <h1 className="text-white text-xl md:text-2xl font-bold">
            Service Plans
          </h1>
          <p className="text-gray-400 text-xs md:text-sm mt-1">
            Manage and view worship service schedules
          </p>
        </div>
        <div className="flex gap-2 md:gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <a
              href="/service_plan/add_service_plan"
              className="flex items-center gap-1 md:gap-2"
            >
              <BsPlus className="w-5 h-5 md:w-4 md:h-4" />
              <div className="hidden sm:block text-sm md:text-base">
                New Plan
              </div>
            </a>
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
              <p className="text-gray-400 text-sm">Total Programs</p>
              <p className="text-white text-2xl font-bold">{totalPrograms}</p>
            </div>
            <BsClock className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-neutral-700/50 rounded-xl p-4 border border-neutral-600/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Participants</p>
              <p className="text-white text-lg font-semibold">
                {uniqueParticipants}
              </p>
            </div>
            <FiUser className="w-8 h-8 text-purple-400" />
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
          <h3 className="text-white font-semibold text-base md:text-lg flex items-center gap-2">
            <FiCalendar className="w-4 h-4 md:w-5 md:h-5" />
            Service Plans History
          </h3>
          <button className="text-blue-400 hover:text-blue-300 text-xs md:text-sm flex items-center gap-1">
            <FiDownload className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Export All</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>

        {servicePlanDates.length === 0 ? (
          <div className="bg-neutral-700/50 rounded-xl p-8 text-center border border-neutral-600/50">
            <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-white text-lg font-medium mb-2">
              No Service Plans Found
            </h3>
            <p className="text-gray-400 mb-4">
              Create your first service plan to get started
            </p>
            <a
              href="/service_plan/add_service_plan"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <BsPlus className="w-4 h-4" />
              Create Service Plan
            </a>
          </div>
        ) : (
          servicePlanDates.map((planDate, index) => (
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
                className="flex items-center justify-between p-4 md:p-6 cursor-pointer hover:bg-neutral-600/30 transition-colors"
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <FiCalendar className="w-6 h-6 md:w-5 md:h-5 text-gray-400" />
                  <div>
                    <h4 className="text-white font-medium text-sm md:text-base">
                      {new Date(planDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </h4>
                    <p className="text-gray-400 text-xs md:text-sm">
                      {ServicePlans[planDate]?.length || 0} programs scheduled
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                  {/* Status Badge */}
                  <span
                    className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      index
                    )}`}
                  >
                    {getStatusText(index)}
                  </span>

                  <div className="flex gap-1 md:gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1.5 md:p-2 hover:bg-neutral-600 rounded-lg transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FiEdit3 className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                    </motion.button>
                  </div>

                  {/* Expand Icon */}
                  <motion.div
                    animate={{ rotate: expandedPlan === planDate ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MdExpandMore className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  </motion.div>
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {expandedPlan === planDate && ServicePlans[planDate] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-neutral-600/50"
                  >
                    <div className="p-4 md:p-6 bg-neutral-800/30">
                      <div className="space-y-2 md:space-y-3">
                        {ServicePlans[planDate].map((program, programIndex) => (
                          <motion.div
                            key={programIndex}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: programIndex * 0.05 }}
                            className="flex flex-col md:flex-row md:items-center md:justify-between p-3 md:p-4 bg-neutral-700/30 rounded-lg hover:bg-neutral-600/30 transition-colors gap-3 md:gap-4"
                          >
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 flex-1">
                              {/* Time Period - Smaller width */}
                              <div className="flex items-center gap-2 text-blue-400 font-mono text-xs md:text-sm md:min-w-[100px] md:max-w-[140px]">
                                <BsClock className="w-3 h-3 md:w-4 md:h-4" />
                                {program.TimePeriod}
                              </div>

                              {/* Program Details - More space */}
                              <div className="flex-1 md:flex-[2]">
                                <h5 className="text-white font-medium text-sm md:text-base">
                                  {program.Program}
                                </h5>
                                <div className="flex items-center gap-2 mt-1">
                                  <FiUser className="w-3 h-3 text-gray-400" />
                                  <span className="text-gray-400 text-xs md:text-sm">
                                    {program.Anchors.join(", ") ||
                                      "No anchors assigned"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Avatars - Right side with more space */}
                            <div className="flex gap-1 flex-wrap md:flex-nowrap md:justify-end md:min-w-[120px]">
                              {program.Anchors.map((anchor, anchorIndex) => (
                                <div
                                  key={anchorIndex}
                                  className="w-6 h-6 md:w-8 md:h-8 bg-neutral-600 rounded-full flex items-center justify-center text-white text-xs font-medium"
                                >
                                  {anchor.charAt(0).toUpperCase()}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Summary */}
                      <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-neutral-600/50">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0 text-xs md:text-sm">
                          <span className="text-gray-400">
                            Total Duration: ~
                            {ServicePlans[planDate].length * 10} minutes
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
          ))
        )}
      </motion.div>
      <div className="mt-25 md:m-0"></div>
    </div>
  );
}

export default ServicePlanPage;
