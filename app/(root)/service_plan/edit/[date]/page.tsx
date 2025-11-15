"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BsClock, BsPlus, BsTrash } from "react-icons/bs";
import { FiSave, FiArrowLeft, FiCalendar } from "react-icons/fi";
import { useRouter, useParams } from "next/navigation";
import { CustomTimePicker } from "@/components/TimePicker";
import {
  Member,
  ServicePlanProgram,
  ServicePlanForm,
  getNextEndTime,
  splitTimePeriod,
  joinTimePeriod,
  toggleCaseInsensitive,
} from "@/lib/servicePlanUtils";

function EditServicePlanPage() {
  const router = useRouter();
  const params = useParams();
  const dateParam = params?.date as string;
  const originalDate = decodeURIComponent(dateParam);

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(true);
  const [planLoading, setPlanLoading] = useState(true);

  const [formData, setFormData] = useState<ServicePlanForm>({
    date: originalDate,
    programs: [],
  });

  // Fetch members for anchors selection
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch("/api/members");
        if (response.ok) {
          const data = await response.json();
          console.log("✅ Members fetched:", data.source || "unknown");
          setMembers(data.data || []);
        } else {
          console.error("Failed to fetch members");
        }
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setMembersLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Fetch existing service plan data
  useEffect(() => {
    const fetchServicePlan = async () => {
      try {
        const response = await fetch("/api/service_plan");
        if (response.ok) {
          const data = await response.json();
          const plans: any = data.data || {};
          const existingPrograms = plans[originalDate] || [];

          if (existingPrograms.length > 0) {
            setFormData({
              date: originalDate,
              programs: existingPrograms.map((p: any) => ({
                TimePeriod: p.TimePeriod,
                Program: p.Program,
                Anchors: p.Anchors || [],
                BackupAnchors: p.BackupAnchors || [],
              })),
            });
          } else {
            alert("Service plan not found");
            router.push("/service_plan");
          }
        } else {
          console.error("Failed to fetch service plan");
        }
      } catch (error) {
        console.error("Error fetching service plan:", error);
      } finally {
        setPlanLoading(false);
      }
    };

    if (originalDate) {
      fetchServicePlan();
    }
  }, [originalDate, router]);

  const addProgram = () => {
    const lastProgram = formData.programs.at(-1);
    const endTime =
      splitTimePeriod(lastProgram?.TimePeriod || "")[1] || "7:05am";
    const newStartTime = endTime;
    const newEndTime = getNextEndTime(endTime);
    setFormData({
      ...formData,
      programs: [
        ...formData.programs,
        {
          TimePeriod: joinTimePeriod(newStartTime, newEndTime),
          Program: "",
          Anchors: [],
          BackupAnchors: [],
        },
      ],
    });
  };

  const removeProgram = (index: number) => {
    setFormData({
      ...formData,
      programs: formData.programs.filter((_, i) => i !== index),
    });
  };

  const updateProgram = (
    index: number,
    field: keyof ServicePlanProgram,
    value: string | string[]
  ) => {
    const updatedPrograms = [...formData.programs];
    updatedPrograms[index] = { ...updatedPrograms[index], [field]: value };
    setFormData({ ...formData, programs: updatedPrograms });
  };

  const updateTimePeriod = (
    index: number,
    startTime: string,
    endTime: string
  ) => {
    updateProgram(index, "TimePeriod", joinTimePeriod(startTime, endTime));
  };

  const toggleAnchorField = (
    programIndex: number,
    field: "Anchors" | "BackupAnchors",
    name: string
  ) => {
    const program = formData.programs[programIndex];
    const selected = program[field];
    const next = selected.some(
      (e: string) => e.toLowerCase() === name.toLowerCase()
    )
      ? selected.filter((e: string) => e.toLowerCase() !== name.toLowerCase())
      : [...selected, name];
    updateProgram(programIndex, field, next);
  };

  const addCustomAnchorTo = (
    programIndex: number,
    field: "Anchors" | "BackupAnchors"
  ) => {
    const input = window.prompt("Enter anchor name");
    const name = (input ?? "").trim();
    if (!name) return;

    const programs = [...formData.programs];
    const p = { ...programs[programIndex] };

    const selected = p[field];
    const exists = selected.some((n) => n.toLowerCase() === name.toLowerCase());
    if (!exists) {
      p[field] = [...selected, name];
    }

    programs[programIndex] = p;
    setFormData({ ...formData, programs });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date) {
      alert("Please select a date");
      return;
    }

    if (formData.programs.some((p) => !p.Program.trim())) {
      alert("Please fill in all program names");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/service_plan", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalDate,
          date: formData.date,
          programs: formData.programs,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Success:", result);
        alert("Service plan updated successfully!");
        router.push("/service_plan");
      } else {
        let msg = "Request failed";
        try {
          const contentType = response.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const data = await response.json();
            msg = data?.error || data?.message || msg;
          } else {
            msg = await response.text();
          }
        } catch (err) {
          msg = response.statusText || msg;
        }
        console.error("❌ Error:", msg);
        alert(`Error: ${msg}`);
      }
    } catch (error) {
      console.error("❌ Network error:", error);
      alert("Failed to update service plan");
    } finally {
      setLoading(false);
    }
  };

  if (planLoading || membersLoading) {
    return (
      <div className="flex-1 px-6 bg-neutral-800/50 backdrop-blur-sm h-screen overflow-y-">
        {/* Header Skeleton */}
        <motion.div className="sticky top-0 z-10 flex justify-between -mx-6 items-center px-6 py-2 mb-6 bg-neutral-700/30 backdrop-blur-sm border-b border-neutral-600/50">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className="p-2 bg-neutral-600 hover:bg-neutral-500 text-white rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
            </motion.button>
            <div>
              <h1 className="text-white text-lg font-bold">
                Edit Service Plan
              </h1>
              <p className="text-gray-400 text-xs">Loading service plan...</p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6 pb-24">
          <div className="bg-neutral-700/30 backdrop-blur-sm p-4 rounded-xl border border-neutral-600/50">
            <div className="h-4 bg-neutral-600/50 rounded animate-pulse w-24 mb-3"></div>
            <div className="h-10 bg-neutral-600/30 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-3 sm:px-6 bg-neutral-800/50 h-full flex flex-col">
      {/* Compact Header */}
      <motion.div className="sticky top-0 z-30 flex justify-between -mx-3 sm:-mx-6 items-center px-3 sm:px-6 py-3 sm:py-2 mb-4 sm:mb-6 bg-neutral-700/30 backdrop-blur-sm border-b border-neutral-600/50">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="p-2 sm:p-2 bg-neutral-600 hover:bg-neutral-500 text-white rounded-lg transition-colors flex-shrink-0"
          >
            <FiArrowLeft className="w-5 h-5 sm:w-4 sm:h-4" />
          </motion.button>
          <div className="min-w-0 flex-1">
            <h1 className="text-white text-base sm:text-lg font-bold truncate">
              Edit Service Plan
            </h1>
            <p className="text-gray-400 text-[10px] sm:text-xs hidden sm:block">
              Update worship service schedule
            </p>
          </div>
        </div>
      </motion.div>

      <form
        id="service-plan-form"
        onSubmit={handleSubmit}
        className="space-y-4 sm:space-y-6 pb-11"
      >
        {/* Date Selection */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-neutral-700/50 rounded-xl p-3 sm:p-4 border border-neutral-600/50"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <FiCalendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            <h3 className="text-white font-semibold text-base sm:text-lg">
              Service Date
            </h3>
          </div>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full p-3 sm:p-3 bg-neutral-600 border border-neutral-500 rounded-lg text-white text-base focus:border-blue-500 focus:outline-none"
            required
          />
        </motion.div>

        {/* Programs Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-neutral-700/50 rounded-xl border border-neutral-600/50 overflow-hidden"
        >
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-neutral-600/50">
            <div className="flex items-center gap-2 sm:gap-3">
              <BsClock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              <h3 className="text-white font-semibold text-base sm:text-lg">
                Service Programs
              </h3>
            </div>
          </div>

          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            <AnimatePresence>
              {formData.programs.map((program, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-neutral-800/30 rounded-lg p-3 sm:p-4 border border-neutral-600/30"
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <h4 className="text-white font-medium text-sm sm:text-base">
                      Program {index + 1}
                    </h4>
                    {formData.programs.length > 1 && (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeProgram(index)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors flex-shrink-0"
                      >
                        <BsTrash className="w-4 h-4 sm:w-4 sm:h-4" />
                      </motion.button>
                    )}
                  </div>

                  <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 mb-3 sm:mb-4">
                    {/* Time Period */}
                    <div>
                      <label className="block text-gray-400 text-xs sm:text-sm mb-2 font-medium">
                        Time Period
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <CustomTimePicker
                            value={splitTimePeriod(program.TimePeriod)[0]}
                            onChange={(time) => {
                              const endTime =
                                splitTimePeriod(program.TimePeriod)[1] ||
                                "7:05am";
                              updateTimePeriod(index, time, endTime);
                            }}
                            placeholder="Start time"
                          />
                        </div>
                        <span className="text-gray-400 font-mono text-sm">
                          ~
                        </span>
                        <div className="flex-1">
                          <CustomTimePicker
                            value={
                              splitTimePeriod(program.TimePeriod)[1] || "7:05am"
                            }
                            onChange={(time) => {
                              const startTime = splitTimePeriod(
                                program.TimePeriod
                              )[0];
                              updateTimePeriod(index, startTime, time);
                            }}
                            placeholder="End time"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Program Name */}
                    <div>
                      <label className="block text-gray-400 text-xs sm:text-sm mb-2 font-medium">
                        Program Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={program.Program}
                          onChange={(e) =>
                            updateProgram(index, "Program", e.target.value)
                          }
                          placeholder="e.g., Opening Prayer, Praise & Worship"
                          className="w-full p-2.5 sm:p-2 pr-8 bg-neutral-600 border border-neutral-500 rounded text-white text-base sm:text-sm focus:border-blue-500 focus:outline-none"
                          required
                        />
                        {program.Program && (
                          <button
                            type="button"
                            onClick={() => updateProgram(index, "Program", "")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-5 sm:h-5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-neutral-500 rounded-full transition-colors text-lg sm:text-base"
                            title="Clear"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 sm:space-y-0 sm:flex-col sm:gap-5 md:flex">
                    <AnchorSelector
                      title="Anchors"
                      members={members}
                      membersLoading={membersLoading}
                      selected={program.Anchors}
                      onToggle={(name) =>
                        toggleAnchorField(index, "Anchors", name)
                      }
                      onAddCustom={() => addCustomAnchorTo(index, "Anchors")}
                    />

                    <div className="sm:mt-4 md:mt-0">
                      <AnchorSelector
                        title="Backup Anchors"
                        members={members}
                        membersLoading={membersLoading}
                        selected={program.BackupAnchors}
                        onToggle={(name) =>
                          toggleAnchorField(index, "BackupAnchors", name)
                        }
                        onAddCustom={() =>
                          addCustomAnchorTo(index, "BackupAnchors")
                        }
                      />
                    </div>
                  </div>

                  {/* Add Program Button - Show only on the last program */}
                  {index === formData.programs.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 pt-4 border-t border-neutral-600/30"
                    >
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={addProgram}
                        className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-neutral-500 hover:border-blue-500 text-gray-400 hover:text-blue-400 rounded-lg transition-all duration-200 hover:bg-blue-500/5"
                      >
                        <BsPlus className="w-5 h-5" />
                        <span>Add Another Program</span>
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Summary */}
            <div className="mt-4 pt-3 border-t border-neutral-600/50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm">
                <span className="text-gray-400">
                  Total Duration: ~{formData.programs.length * 10} minutes
                </span>
                <span className="text-gray-400">
                  {new Set(formData.programs.flatMap((p) => p.Anchors)).size}{" "}
                  unique participants
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </form>

      {/* Floating Action Button */}
      <motion.button
        type="submit"
        form="service-plan-form"
        disabled={loading}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-24 right-6 w-14 h-14 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all z-50 flex items-center justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
          />
        ) : (
          <FiSave className="w-6 h-6" />
        )}
      </motion.button>
    </div>
  );
}

// Reusable selector component
function AnchorSelector(props: {
  title: string;
  members: Member[];
  membersLoading: boolean;
  selected: string[];
  onToggle: (name: string) => void;
  onAddCustom: () => void;
}) {
  const { title, members, membersLoading, selected, onToggle, onAddCustom } =
    props;
  const [search, setSearch] = useState("");

  const customFiltered: string[] = [];
  const customLower = new Set<string>(
    customFiltered.map((n) => n.toLowerCase())
  );
  const normalFiltered = members
    .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
    .filter((m) => !customLower.has(m.name.toLowerCase()));

  return (
    <div>
      <label className="block text-gray-400 text-xs sm:text-sm mb-2 font-medium">
        {title} ({selected.length} selected)
      </label>

      {membersLoading ? (
        <div className="relative">
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-neutral-700/80 backdrop-blur-sm rounded-lg">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-gray-400/30 border-t-gray-400 rounded-full mb-2"
            />
            <span className="text-gray-300 text-xs sm:text-sm">
              Loading members...
            </span>
          </div>
          <div className="max-h-40 sm:max-h-32 overflow-hidden border border-neutral-600 rounded-lg p-2 bg-neutral-700/20 opacity-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded">
                  <div className="w-4 h-4 bg-neutral-600/40 rounded animate-pulse" />
                  <div className="h-3 bg-neutral-600/40 rounded animate-pulse flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-h-48 sm:max-h-32 overflow-y-auto slim-scrollbar border border-neutral-600 rounded-lg p-2 bg-neutral-700/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {/* Search */}
            <div className="mb-2 col-span-1 sm:col-span-2 md:col-span-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search members..."
                className="w-full p-2.5 sm:p-2 bg-neutral-600 border border-neutral-500 rounded text-white text-base sm:text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Custom anchors first */}
            {customFiltered.map((name) => (
              <label
                key={`custom-${name}`}
                className="flex items-center gap-2 p-2 hover:bg-neutral-600/30 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.some(
                    (n) => n.toLowerCase() === name.toLowerCase()
                  )}
                  onChange={() => onToggle(name)}
                  className="w-4 h-4 text-blue-600 bg-neutral-600 border-neutral-500 rounded focus:ring-blue-500"
                />
                <span className="text-white capitalize text-sm">{name}</span>
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-400/30">
                  Custom
                </span>
              </label>
            ))}

            {/* Normal members (deduped) */}
            {normalFiltered.map((m) => (
              <label
                key={m.id}
                className="flex items-center gap-2 p-2.5 sm:p-2 hover:bg-neutral-600/30 rounded cursor-pointer active:bg-neutral-600/50"
              >
                <input
                  type="checkbox"
                  checked={selected.some(
                    (n) => n.toLowerCase() === m.name.toLowerCase()
                  )}
                  onChange={() => onToggle(m.name)}
                  className="w-5 h-5 sm:w-4 sm:h-4 text-blue-600 bg-neutral-600 border-neutral-500 rounded focus:ring-blue-500 flex-shrink-0"
                />
                <span className="text-white capitalize text-sm sm:text-sm">
                  {m.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Add custom anchor */}
      <div className="mt-2">
        <button
          type="button"
          onClick={onAddCustom}
          className="inline-flex items-center gap-2 px-3 py-2 sm:py-1.5 text-sm rounded-md border border-neutral-500 hover:border-blue-500 text-gray-300 hover:text-blue-400 bg-neutral-700/30 hover:bg-blue-500/5 transition-colors active:bg-blue-500/10"
        >
          <BsPlus className="w-5 h-5 sm:w-4 sm:h-4" />
          Add anchor by name
        </button>
      </div>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selected.map((name, i) => (
            <button
              key={`${name}-${i}`}
              type="button"
              onClick={() => onToggle(name)}
              className="group relative px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-full text-xs border border-blue-500/30 hover:border-blue-500/50 transition-all flex items-center gap-1.5 pr-1.5"
            >
              <span>{name}</span>
              <span className="w-4 h-4 flex items-center justify-center rounded-full bg-white/20 group-hover:bg-white/30 text-white text-xs font-bold transition-colors">
                ×
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default EditServicePlanPage;
