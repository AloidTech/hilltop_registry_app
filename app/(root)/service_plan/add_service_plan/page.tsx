"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BsChevronDown, BsClock, BsPlus, BsTrash } from "react-icons/bs";
import { FiSave, FiArrowLeft, FiCalendar } from "react-icons/fi";
import { useRouter } from "next/navigation";

interface Member {
  id: string;
  name: string;
  email: string;
  number: string | null;
  parentNum: string | null;
  role: string | null;
  team: string | null;
}

interface ServicePlanProgram {
  TimePeriod: string;
  Program: string;
  Anchors: string[];
  BackupAnchors: string[];
  // CustomAnchors: string[]; // removed: derive customs from selected vs members
}

interface ServicePlanForm {
  date: string;
  programs: ServicePlanProgram[];
}

const timeOptions = [
  "7:00am",
  "7:05am",
  "7:10am",
  "7:15am",
  "7:20am",
  "7:25am",
  "7:30am",
  "7:35am",
  "7:40am",
  "7:45am",
  "7:50am",
  "7:55am",
  "8:00am",
  "8:05am",
  "8:10am",
  "8:15am",
  "8:20am",
  "8:25am",
  "8:30am",
  "8:35am",
  "8:40am",
  "8:45am",
  "8:50am",
  "8:55am",
  "9:00am",
  "9:05am",
  "9:10am",
  "9:15am",
  "9:20am",
  "9:25am",
  "9:30am",
  "9:35am",
  "9:40am",
  "9:45am",
  "9:50am",
  "9:55am",
  "10:00am",
  "10:05am",
  "10:10am",
  "10:15am",
  "10:20am",
  "10:25am",
  "10:30am",
  "10:35am",
  "10:40am",
  "10:45am",
  "10:50am",
  "10:55am",
  "11:00am",
  "11:05am",
  "11:10am",
  "11:15am",
  "11:20am",
  "11:25am",
  "11:30am",
  "11:35am",
  "11:40am",
  "11:45am",
  "11:50am",
  "11:55am",
  "12:00pm",
  "12:05pm",
  "12:10pm",
  "12:15pm",
  "12:20pm",
  "12:25pm",
  "12:30pm",
];

// Custom Time Picker Component
interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  placeholder?: string;
}

const CustomTimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  placeholder = "Select time",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  // Filter by search
  const filtered = useMemo(
    () =>
      timeOptions.filter((t) =>
        t.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [searchTerm]
  );

  // Reorder so the list STARTS at the currently picked time, wrapping around
  const orderedOptions = useMemo(() => {
    if (!value) return filtered;
    const i = filtered.findIndex((t) => t === value);
    if (i <= 0) return filtered;
    return [...filtered.slice(i), ...filtered.slice(0, i)];
  }, [filtered, value]);

  // When opening, scroll the selected option into view
  useEffect(() => {
    if (!isOpen) return;
    const id = requestAnimationFrame(() => {
      const el = listRef.current?.querySelector<HTMLElement>(
        `[data-time="${CSS.escape(value)}"]`
      );
      el?.scrollIntoView({ block: "nearest" });
    });
    return () => cancelAnimationFrame(id);
  }, [isOpen, value]);

  const handleSelect = (time: string) => {
    onChange(time);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 bg-neutral-600 border border-neutral-500 rounded text-white focus:border-blue-500 focus:outline-none flex items-center justify-between hover:bg-neutral-550 transition-colors"
      >
        <span className={value ? "text-white" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <BsChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-neutral-700 border border-neutral-600 rounded-lg shadow-xl max-h-60 overflow-hidden"
          >
            <div className="p-2 border-b border-neutral-600">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search time..."
                className="w-full p-2 bg-neutral-600 border border-neutral-500 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                autoFocus
              />
            </div>

            <div ref={listRef} className="overflow-y-auto max-h-48">
              {orderedOptions.length > 0 ? (
                orderedOptions.map((time) => (
                  <button
                    key={time}
                    data-time={time}
                    type="button"
                    onClick={() => handleSelect(time)}
                    className={`w-full p-2 text-left hover:bg-neutral-600 transition-colors text-sm ${
                      value === time
                        ? "bg-blue-600 text-white"
                        : "text-gray-200 hover:text-white"
                    }`}
                  >
                    {time}
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-400 text-sm">
                  No times found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

function AddServicePlanPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(true);
  // removed old global anchor search; each selector manages its own query

  const [formData, setFormData] = useState<ServicePlanForm>({
    date: "",
    programs: [
      {
        TimePeriod: "7:00am ~ 7:05am",
        Program: "Opening Prayer",
        Anchors: [],
        BackupAnchors: [],
        // CustomAnchors: [], // removed
      },
    ],
  });

  // Fetch members for anchors selection
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch("/api/members");
        if (response.ok) {
          const data = await response.json();
          console.log("✅ Members fetched:", data.source || "unknown"); // Log cache source
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

  const addProgram = () => {
    const lastProgram = formData.programs.at(-1);
    const endTime = lastProgram?.TimePeriod.split("~")[1] || "7:05am";
    const newStartTime = endTime;
    const newEndTime = getNextEndTime(endTime);
    setFormData({
      ...formData,
      programs: [
        ...formData.programs,
        {
          TimePeriod: `${newStartTime} ~ ${newEndTime}`,
          Program: "",
          Anchors: [],
          BackupAnchors: [],
          // CustomAnchors: [], // removed
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

  const getNextEndTime = (currentTime: string) => {
    // currentTime examples: "7:05am", "12:30pm"
    const parts = currentTime.split(":");
    const hourPart = parts[0];
    const minutePart = parts[1] || "";

    // extract meridiem (am/pm) and numeric minute
    const meridiemMatch = minutePart.match(/(am|pm)$/i);
    const tOD = meridiemMatch ? meridiemMatch[1].toLowerCase() : "";
    const minuteDigits = minutePart.replace(/[^0-9]/g, "");
    const intMinute = parseInt(minuteDigits || "0", 10);

    // parse hour as number
    let hourNum = parseInt(hourPart, 10) || 0;
    let newMinute = intMinute + 5;
    let newTOD = tOD;

    // handle minute overflow
    if (newMinute >= 60) {
      newMinute -= 60;
      // increment hour using 12-hour wrap
      hourNum = (hourNum % 12) + 1;
      // flip meridiem when crossing 11->12 boundary
      if (hourNum === 12) {
        newTOD = tOD === "am" ? "pm" : tOD === "pm" ? "am" : tOD;
      }
    }

    const newEndTime = `${hourNum}:${String(newMinute).padStart(
      2,
      "0"
    )}${newTOD}`;
    console.log("time of day: ", tOD, "minute: ", minutePart);
    return newEndTime;
  };

  // removed unused calculateTotalTime helper

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
    updateProgram(index, "TimePeriod", `${startTime} ~ ${endTime}`);
  };

  // removed old toggleAnchor; using typed toggleAnchorField instead

  // Toggle selection for either Anchors or BackupAnchors
  const toggleAnchorField = (
    programIndex: number,
    field: "Anchors" | "BackupAnchors",
    name: string
  ) => {
    const program = formData.programs[programIndex];
    const selected = program[field];
    const exists = selected.some((n) => n.toLowerCase() === name.toLowerCase());
    const next = exists
      ? selected.filter((n) => n.toLowerCase() !== name.toLowerCase())
      : [...selected, name];
    updateProgram(programIndex, field, next);
  };

  // Add a custom anchor by just selecting it in the target field.
  // It will appear as "custom" because it's not in members.
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

  // per-selector filtering handled within AnchorSelector

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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Success:", result);
        alert("Service plan added successfully!");
        router.push("/service_plan");
      } else {
        const error = await response.json();
        console.error("❌ Error:", error);
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("❌ Network error:", error);
      alert("Failed to add service plan");
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen while members are being fetched
  if (membersLoading) {
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
              <h1 className="text-white text-lg font-bold">Add Service Plan</h1>
              <p className="text-gray-400 text-xs">
                Create a new worship service schedule
              </p>
            </div>
          </div>

          {/* Save Button in Header */}
          <div className="flex gap-3">
            <motion.button
              type="submit"
              form="service-plan-form"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
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
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  <span className="hidden md:inline">Saving...</span>
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  <span className="hidden md:inline">Save Plan</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Form Skeleton */}
        <div className="space-y-6 pb-24">
          {/* Date Selection Skeleton */}
          <div className="bg-neutral-700/30 backdrop-blur-sm p-4 rounded-xl border border-neutral-600/50">
            <div className="h-4 bg-neutral-600/50 rounded animate-pulse w-24 mb-3"></div>
            <div className="h-10 bg-neutral-600/30 rounded-lg animate-pulse"></div>
          </div>

          {/* Programs Skeleton */}
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-neutral-700/30 backdrop-blur-sm p-4 rounded-xl border border-neutral-600/50"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="h-5 bg-neutral-600/50 rounded animate-pulse w-32"></div>
                  <div className="h-8 w-8 bg-neutral-600/50 rounded-lg animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-neutral-600/50 rounded animate-pulse w-20"></div>
                    <div className="h-10 bg-neutral-600/30 rounded-lg animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-neutral-600/50 rounded animate-pulse w-16"></div>
                    <div className="h-10 bg-neutral-600/30 rounded-lg animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-neutral-600/50 rounded animate-pulse w-24"></div>
                    <div className="h-32 bg-neutral-600/30 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Program Button Skeleton */}
          <div className="h-12 bg-neutral-600/30 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-6 bg-neutral-800/50 h-full flex flex-col">
      {/* Compact Header */}
      <motion.div className="sticky top-0 z-30 flex justify-between -mx-6 items-center px-6 py-2 mb-6 bg-neutral-700/30 backdrop-blur-sm border-b border-neutral-600/50">
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
            <h1 className="text-white text-lg font-bold">Add Service Plan</h1>
            <p className="text-gray-400 text-xs">
              Create a new worship service schedule
            </p>
          </div>
        </div>

        {/* Save Button in Header */}
        <div className="flex gap-3">
          <motion.button
            type="submit"
            form="service-plan-form"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
                <span className="hidden md:inline">Saving...</span>
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4" />
                <span className="hidden md:inline">Save Plan</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      <form
        id="service-plan-form"
        onSubmit={handleSubmit}
        className="space-y-6 pb-11"
      >
        {/* Date Selection */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-neutral-700/50 rounded-xl p-4 border border-neutral-600/50"
        >
          <div className="flex items-center gap-3 mb-4">
            <FiCalendar className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-semibold text-lg">Service Date</h3>
          </div>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full p-3 bg-neutral-600 border border-neutral-500 rounded-lg text-white focus:border-blue-500 focus:outline-none"
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
          <div className="flex items-center justify-between p-4 border-b border-neutral-600/50">
            <div className="flex items-center gap-3">
              <BsClock className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-semibold text-lg">
                Service Programs
              </h3>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <AnimatePresence>
              {formData.programs.map((program, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-neutral-800/30 rounded-lg p-4 border border-neutral-600/30"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-white font-medium">
                      Program {index + 1}
                    </h4>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Time Period */}
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">
                        Time Period
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <CustomTimePicker
                            value={program.TimePeriod.split(" ~ ")[0]}
                            onChange={(time) => {
                              const endTime =
                                program.TimePeriod.split(" ~ ")[1] || "7:05am";
                              updateTimePeriod(index, time, endTime);
                            }}
                            placeholder="Start time"
                          />
                        </div>
                        <span className="text-gray-400 font-mono">~</span>
                        <div className="flex-1">
                          <CustomTimePicker
                            value={
                              program.TimePeriod.split(" ~ ")[1] || "7:05am"
                            }
                            onChange={(time) => {
                              const startTime =
                                program.TimePeriod.split(" ~ ")[0];
                              updateTimePeriod(index, startTime, time);
                            }}
                            placeholder="End time"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Program Name */}
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">
                        Program Name
                      </label>
                      <input
                        type="text"
                        value={program.Program}
                        onChange={(e) =>
                          updateProgram(index, "Program", e.target.value)
                        }
                        placeholder="e.g., Opening Prayer, Praise & Worship"
                        className="w-full p-2 bg-neutral-600 border border-neutral-500 rounded text-white focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex-col gap-5 md:flex">
                    <AnchorSelector
                      title="Anchors"
                      members={members}
                      membersLoading={membersLoading}
                      selected={program.Anchors}
                      // customAnchors={program.CustomAnchors}
                      onToggle={(name) =>
                        toggleAnchorField(index, "Anchors", name)
                      }
                      onAddCustom={() => addCustomAnchorTo(index, "Anchors")}
                    />

                    <div className="mt-4 md:mt-0">
                      <AnchorSelector
                        title="Backup Anchors"
                        members={members}
                        membersLoading={membersLoading}
                        selected={program.BackupAnchors}
                        // customAnchors={program.CustomAnchors}
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
                        whileTap={{ scale: 0.05 }}
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
    </div>
  );
}

// Reusable selector component
function AnchorSelector(props: {
  title: string;
  members: Member[];
  membersLoading: boolean;
  selected: string[];
  // customAnchors: string[];
  onToggle: (name: string) => void;
  onAddCustom: () => void;
}) {
  const {
    title,
    members,
    membersLoading,
    selected,
    // customAnchors,
    onToggle,
    onAddCustom,
  } = props;
  const [search, setSearch] = useState("");

  const customFiltered: string[] = []; // customAnchors.filter((n) =>
  // n.toLowerCase().includes(search.toLowerCase())
  // );
  const customLower = new Set<string>(
    customFiltered.map((n) => n.toLowerCase())
  );
  const normalFiltered = members
    .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
    .filter((m) => !customLower.has(m.name.toLowerCase())); // avoid duplicates

  return (
    <div>
      <label className="block text-gray-400 text-sm mb-2">
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
        <div className="max-h-32 overflow-y-auto slim-scrollbar border border-neutral-600 rounded-lg p-2 bg-neutral-700/30">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {/* Search */}
            <div className="mb-2 col-span-2 md:col-span-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search members..."
                className="w-full p-2 bg-neutral-600 border border-neutral-500 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
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
                className="flex items-center gap-2 p-2 hover:bg-neutral-600/30 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.some(
                    (n) => n.toLowerCase() === m.name.toLowerCase()
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
            <span
              key={`${name}-${i}`}
              className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs border border-blue-500/30"
            >
              {name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default AddServicePlanPage;
