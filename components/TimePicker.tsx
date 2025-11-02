import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { BsChevronDown } from "react-icons/bs";

function formatMinutesAsTime(totalMinutes: number): string {
  const hour24 = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const meridiem = hour24 >= 12 ? "pm" : "am";
  const hour12 = ((hour24 + 11) % 12) + 1;
  return `${hour12}:${String(minute).padStart(2, "0")}${meridiem}`;
}

function generateTimeOptions(
  startHour24: number,
  endHour24: number,
  stepMinutes: number
): string[] {
  const options: string[] = [];
  for (let m = startHour24 * 60; m <= endHour24 * 60; m += stepMinutes) {
    options.push(formatMinutesAsTime(m));
  }
  return options;
}

const timeOptions = generateTimeOptions(7, 21, 5);

// Custom Time Picker Component
interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  placeholder?: string;
}

export const CustomTimePicker: React.FC<TimePickerProps> = ({
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
    const i = filtered.findIndex((t: string) => t === value);
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
                orderedOptions.map((time: string) => (
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
