"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BsClock, BsPlus, BsTrash } from "react-icons/bs";
import { FiSave, FiX, FiCalendar } from "react-icons/fi";
import { useOrgStore } from "@/lib/store";
import { CustomTimePicker } from "@/components/forms/TimePicker";
import {
  Member,
  ServicePlanProgram,
  ServicePlanForm as ServicePlanFormType,
  getNextEndTime,
  splitTimePeriod,
  joinTimePeriod,
} from "@/lib/servicePlanUtils";

// Slide transition for the panel
const slideTransition = {
  initial: { x: "100%", opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: "100%", opacity: 0 },
  transition: { type: "spring" as const, stiffness: 400, damping: 35 },
};

interface ServicePlanFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: "create" | "edit";
  editDate?: string; // For edit mode - the original date
}

export function ServicePlanFormPanel({
  isOpen,
  onClose,
  onSuccess,
  mode,
  editDate,
}: ServicePlanFormProps) {
  const { selectedOrg } = useOrgStore();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(true);
  const [planLoading, setPlanLoading] = useState(mode === "edit");

  const [formData, setFormData] = useState<ServicePlanFormType>({
    date: editDate || "",
    programs: [
      {
        TimePeriod: "7:00am ~ 7:05am",
        Program: "Opening Prayer",
        Anchors: [],
        BackupAnchors: [],
      },
    ],
  });

  // Fetch members for anchors selection
  useEffect(() => {
    if (!isOpen) return;

    if (!selectedOrg) {
      setMembersLoading(false);
      return;
    }

    const fetchMembers = async () => {
      setMembersLoading(true);
      try {
        const response = await fetch(`/api/members?org_id=${selectedOrg.id}`);
        if (response.ok) {
          const data = await response.json();
          setMembers(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setMembersLoading(false);
      }
    };

    fetchMembers();
  }, [selectedOrg, isOpen]);

  // Fetch existing service plan data (edit mode)
  useEffect(() => {
    if (!isOpen || mode !== "edit" || !editDate) return;

    const fetchServicePlan = async () => {
      setPlanLoading(true);
      try {
        const response = await fetch(
          `/api/service_plan?org_id=${selectedOrg?.id}`,
        );
        if (response.ok) {
          const data = await response.json();
          const plans: { [key: string]: ServicePlanProgram[] } =
            data.data || {};
          const existingPrograms = plans[editDate] || [];

          if (existingPrograms.length > 0) {
            setFormData({
              date: editDate,
              programs: existingPrograms.map((p: ServicePlanProgram) => ({
                TimePeriod: p.TimePeriod,
                Program: p.Program,
                Anchors: p.Anchors || [],
                BackupAnchors: p.BackupAnchors || [],
              })),
            });
          }
        }
      } catch (error) {
        console.error("Error fetching service plan:", error);
      } finally {
        setPlanLoading(false);
      }
    };

    fetchServicePlan();
  }, [editDate, isOpen, mode, selectedOrg?.id]);

  // Reset form when opening in create mode
  useEffect(() => {
    if (isOpen && mode === "create") {
      setFormData({
        date: "",
        programs: [
          {
            TimePeriod: "7:00am ~ 7:05am",
            Program: "Opening Prayer",
            Anchors: [],
            BackupAnchors: [],
          },
        ],
      });
    }
  }, [isOpen, mode]);

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
    value: string | string[],
  ) => {
    const updatedPrograms = [...formData.programs];
    updatedPrograms[index] = { ...updatedPrograms[index], [field]: value };
    setFormData({ ...formData, programs: updatedPrograms });
  };

  const updateTimePeriod = (
    index: number,
    startTime: string,
    endTime: string,
  ) => {
    updateProgram(index, "TimePeriod", joinTimePeriod(startTime, endTime));
  };

  const toggleAnchorField = (
    programIndex: number,
    field: "Anchors" | "BackupAnchors",
    name: string,
  ) => {
    const program = formData.programs[programIndex];
    const selected = program[field];
    const next = selected.some(
      (e: string) => e.toLowerCase() === name.toLowerCase(),
    )
      ? selected.filter((e: string) => e.toLowerCase() !== name.toLowerCase())
      : [...selected, name];
    updateProgram(programIndex, field, next);
  };

  const addCustomAnchorTo = (
    programIndex: number,
    field: "Anchors" | "BackupAnchors",
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
      const endpoint = "/api/service_plan";
      const method = mode === "create" ? "POST" : "PATCH";
      const body =
        mode === "create"
          ? { ...formData, org_id: selectedOrg?.id }
          : {
              originalDate: editDate,
              date: formData.date,
              programs: formData.programs,
              org_id: selectedOrg?.id,
            };

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        onSuccess();
        onClose();
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
        } catch {
          msg = response.statusText || msg;
        }
        alert(`Error: ${msg}`);
      }
    } catch (error) {
      console.error("Network error:", error);
      alert(`Failed to ${mode === "create" ? "add" : "update"} service plan`);
    } finally {
      setLoading(false);
    }
  };

  const isLoading = membersLoading || (mode === "edit" && planLoading);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Slide-in Panel */}
          <motion.div
            {...slideTransition}
            className="fixed right-0 top-0 h-full w-full md:w-[600px] lg:w-[700px] bg-[var(--bg-primary)] z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-4 sm:px-6 py-4 bg-neutral-700/30 backdrop-blur-sm border-b border-neutral-600/50">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-white text-lg font-bold">
                    {mode === "create"
                      ? "Add Service Plan"
                      : "Edit Service Plan"}
                  </h1>
                  <p className="text-gray-400 text-xs">
                    {mode === "create"
                      ? "Create a new worship service schedule"
                      : "Update worship service schedule"}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 bg-neutral-600 hover:bg-neutral-500 text-white rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
              {isLoading ? (
                <div className="space-y-6">
                  <div className="bg-neutral-700/30 p-4 rounded-xl border border-neutral-600/50">
                    <div className="h-4 bg-neutral-600/50 rounded animate-pulse w-24 mb-3" />
                    <div className="h-10 bg-neutral-600/30 rounded-lg animate-pulse" />
                  </div>
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="bg-neutral-700/30 p-4 rounded-xl border border-neutral-600/50"
                    >
                      <div className="h-5 bg-neutral-600/50 rounded animate-pulse w-32 mb-4" />
                      <div className="space-y-3">
                        <div className="h-10 bg-neutral-600/30 rounded-lg animate-pulse" />
                        <div className="h-10 bg-neutral-600/30 rounded-lg animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <form
                  id="service-plan-form"
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  {/* Date Selection */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-neutral-700/50 rounded-xl p-4 border border-neutral-600/50"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <FiCalendar className="w-5 h-5 text-blue-400" />
                      <h3 className="text-white font-semibold">Service Date</h3>
                    </div>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="w-full p-3 bg-neutral-600 border border-neutral-500 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </motion.div>

                  {/* Programs Section */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-3">
                        <BsClock className="w-5 h-5 text-blue-400" />
                        <h3 className="text-white font-semibold">
                          Service Programs
                        </h3>
                      </div>
                      <span className="text-gray-400 text-sm">
                        {formData.programs.length} program
                        {formData.programs.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <AnimatePresence>
                      {formData.programs.map((program, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="bg-neutral-700/50 rounded-xl p-4 border-2 border-neutral-600/50 hover:border-neutral-500/70 transition-all"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 font-bold text-sm border border-blue-500/30">
                                {index + 1}
                              </span>
                              <h4 className="text-white font-semibold">
                                Program {index + 1}
                              </h4>
                            </div>
                            {formData.programs.length > 1 && (
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removeProgram(index)}
                                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                              >
                                <BsTrash className="w-4 h-4" />
                              </motion.button>
                            )}
                          </div>

                          <div className="space-y-4">
                            {/* Time Period */}
                            <div>
                              <label className="block text-gray-400 text-sm mb-2 font-medium">
                                Time Period
                              </label>
                              <div className="flex items-center gap-2">
                                <div className="flex-1">
                                  <CustomTimePicker
                                    value={
                                      splitTimePeriod(program.TimePeriod)[0]
                                    }
                                    onChange={(time) => {
                                      const endTime =
                                        splitTimePeriod(
                                          program.TimePeriod,
                                        )[1] || "7:05am";
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
                                      splitTimePeriod(program.TimePeriod)[1] ||
                                      "7:05am"
                                    }
                                    onChange={(time) => {
                                      const startTime = splitTimePeriod(
                                        program.TimePeriod,
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
                              <label className="block text-gray-400 text-sm mb-2 font-medium">
                                Program Name
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={program.Program}
                                  onChange={(e) =>
                                    updateProgram(
                                      index,
                                      "Program",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="e.g., Opening Prayer, Praise & Worship"
                                  className="w-full p-3 pr-8 bg-neutral-600 border border-neutral-500 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                  required
                                />
                                {program.Program && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateProgram(index, "Program", "")
                                    }
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white hover:bg-neutral-500 rounded-full transition-colors"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Anchors */}
                            <AnchorSelector
                              title="Anchors"
                              members={members}
                              membersLoading={membersLoading}
                              selected={program.Anchors}
                              onToggle={(name) =>
                                toggleAnchorField(index, "Anchors", name)
                              }
                              onAddCustom={() =>
                                addCustomAnchorTo(index, "Anchors")
                              }
                            />

                            {/* Backup Anchors */}
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
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Add Program Button */}
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={addProgram}
                      className="w-full flex items-center justify-center gap-2 p-4 bg-neutral-700/30 hover:bg-neutral-700/50 border-2 border-dashed border-neutral-500 hover:border-blue-500 text-gray-400 hover:text-blue-400 rounded-xl transition-all"
                    >
                      <BsPlus className="w-6 h-6" />
                      <span className="font-medium">Add Another Program</span>
                    </motion.button>

                    {/* Summary */}
                    <div className="bg-neutral-700/30 rounded-xl p-4 border border-neutral-600/50">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">
                          📅 Total Duration: ~{formData.programs.length * 10}{" "}
                          minutes
                        </span>
                        <span className="text-gray-400">
                          👥{" "}
                          {
                            new Set(formData.programs.flatMap((p) => p.Anchors))
                              .size
                          }{" "}
                          unique participants
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </form>
              )}
            </div>

            {/* Footer with Save Button */}
            <div className="px-4 sm:px-6 py-4 bg-neutral-800/50 border-t border-neutral-600/50">
              <motion.button
                type="submit"
                form="service-plan-form"
                disabled={loading || isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-xl transition-colors font-medium"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="w-5 h-5" />
                    <span>
                      {mode === "create" ? "Save Plan" : "Update Plan"}
                    </span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
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

  const normalFiltered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <label className="block text-gray-400 text-sm mb-2 font-medium">
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
            <span className="text-gray-300 text-sm">Loading members...</span>
          </div>
          <div className="max-h-32 overflow-hidden border border-neutral-600 rounded-lg p-2 bg-neutral-700/20 opacity-50">
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded">
                  <div className="w-4 h-4 bg-neutral-600/40 rounded animate-pulse" />
                  <div className="h-3 bg-neutral-600/40 rounded animate-pulse flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-h-40 overflow-y-auto slim-scrollbar border border-neutral-600 rounded-lg p-2 bg-neutral-700/30">
          <div className="grid grid-cols-2 gap-2">
            {/* Search */}
            <div className="mb-2 col-span-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search members..."
                className="w-full p-2 bg-neutral-600 border border-neutral-500 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Members */}
            {normalFiltered.map((m) => (
              <label
                key={m.id}
                className="flex items-center gap-2 p-2 hover:bg-neutral-600/30 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.some(
                    (n) => n.toLowerCase() === m.name.toLowerCase(),
                  )}
                  onChange={() => onToggle(m.name)}
                  className="w-4 h-4 text-blue-600 bg-neutral-600 border-neutral-500 rounded focus:ring-blue-500"
                />
                <span className="text-white capitalize text-sm">{m.name}</span>
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
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border border-neutral-500 hover:border-blue-500 text-gray-300 hover:text-blue-400 bg-neutral-700/30 hover:bg-blue-500/5 transition-colors"
        >
          <BsPlus className="w-4 h-4" />
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
              className="group relative px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-full text-xs border border-blue-500/30 hover:border-blue-500/50 transition-all flex items-center gap-1.5"
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
