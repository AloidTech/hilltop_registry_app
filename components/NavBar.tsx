"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MdMenu } from "react-icons/md";
import { BiCalendarEvent, BiUserCircle } from "react-icons/bi";
import { FiUsers, FiSettings, FiBriefcase } from "react-icons/fi";

export function NavBarDeskt() {
  const [pressedButtonId, setPressedButtonId] = useState("1");
  const router = useRouter();
  const pathname = usePathname();

  // Detect current page for active state
  useEffect(() => {
    if (pathname === "/" || pathname?.startsWith("/members"))
      setPressedButtonId("1");
    else if (pathname?.startsWith("/service_plan")) setPressedButtonId("2");
    else if (pathname?.startsWith("/organisation")) setPressedButtonId("5");
    else if (pathname?.startsWith("/settings")) setPressedButtonId("9");
    else if (
      pathname?.startsWith("/auth/login") ||
      pathname?.startsWith("/profile")
    )
      setPressedButtonId("10");
  }, [pathname]);

  const baseBtn =
    "flex items-center justify-center rounded-md transition-colors text-neutral-200 hover:bg-neutral-700/60";
  // Stronger than hover: darker bg + ring, and keep same on hover so it doesn't lighten
  const activeBtn =
    "bg-neutral-600 text-white hover:bg-neutral-600 ring-1 ring-neutral-500/70";

  return (
    <div className="flex flex-col items-center justify-start h-screen w-16 py-3 bg-neutral-800 border-r border-neutral-700/40">
      {/* Top/menu */}
      <button
        title="Menu"
        className={`${baseBtn} w-11 h-11 mb-2`}
        onClick={() => {}}
      >
        <MdMenu size={24} />
      </button>

      {/* Members */}
      <button
        title="Members"
        onClick={() => {
          setPressedButtonId("1");
          router.push("/");
        }}
        className={`${baseBtn} w-11 h-11 mt-2 ${
          pressedButtonId === "1" ? activeBtn : ""
        }`}
      >
        <FiUsers size={24} />
      </button>

      {/* Service Plan */}
      <button
        title="Service Plan"
        onClick={() => {
          setPressedButtonId("2");
          router.push("/service_plan");
        }}
        className={`${baseBtn} w-11 h-11 mt-2 ${
          pressedButtonId === "2" ? activeBtn : ""
        }`}
      >
        <BiCalendarEvent size={24} />
      </button>

      {/* Divider */}
      <div className="my-3 h-px w-9 bg-neutral-700/50 rounded-full" />

      {/* Organization (middle between bars) */}
      <button
        title="Organization"
        onClick={() => {
          setPressedButtonId("5");
          router.push("/organisation");
        }}
        className={`${baseBtn} w-11 h-11 ${
          pressedButtonId === "5" ? activeBtn : ""
        }`}
      >
        <FiBriefcase size={24} />
      </button>

      {/* Spacer pushes the bottom group to the bottom */}
      <div className="mt-auto" />
      {/* Divider */}
      <div className="my-3 h-px w-9 bg-neutral-700/50 rounded-full" />

      {/* Settings */}
      <button
        title="Settings"
        onClick={() => {
          setPressedButtonId("9");
          router.push("/settings");
        }}
        className={`${baseBtn} w-11 h-11 mb-2 ${
          pressedButtonId === "9" ? activeBtn : ""
        }`}
      >
        <FiSettings size={24} />
      </button>

      {/* Bottom/profile (user icon) */}
      <button
        title="Profile"
        onClick={() => {
          setPressedButtonId("10");
          router.push("/auth/login"); // change to /profile if you have a profile page
        }}
        className={`${baseBtn} w-11 h-11 mb-2 ${
          pressedButtonId === "10" ? activeBtn : ""
        }`}
      >
        <BiUserCircle size={30} />
      </button>
    </div>
  );
}

export const NavBarMobile = () => {
  const [pressedButtonId, setPressedButtonId] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  const pathDepth = useMemo(() => {
    return pathname?.split("/").filter(Boolean).length || 0;
  }, [pathname]);

  useEffect(() => {
    if (pathname === "/" || pathname?.startsWith("/members"))
      setPressedButtonId("1");
    else if (pathname?.startsWith("/service_plan")) setPressedButtonId("2");
    else if (pathname?.startsWith("/organisation")) setPressedButtonId("org");
  }, [pathname]);

  const baseBtn =
    "flex items-center justify-center rounded-xl transition-colors text-neutral-200 hover:bg-neutral-700/60";
  // Stronger than hover on mobile too
  const activeBtn =
    "bg-neutral-600 text-white hover:bg-neutral-600 ring-1 ring-neutral-500/70";

  // Hide on nested paths (depth > 1), but keep it for /auth/login if needed
  if (pathDepth > 1 && !pathname?.startsWith("/auth")) {
    return null;
  }
  return (
    <div className="flex justify-center gap-10 items-center w-full py-2 px-5 bg-neutral-800 border-t border-neutral-700/50">
      <div className="flex flex-col mb-2 mt-1 items-center">
        <button
          title="Members"
          onClick={() => {
            setPressedButtonId("1");
            router.push("/");
          }}
          className={`${baseBtn} w-12 h-10 mb-1.5 ${
            pressedButtonId === "1" ? activeBtn : ""
          }`}
        >
          <FiUsers size={22} />
        </button>
        <p className="text-xs text-center text-gray-400">Members</p>
      </div>

      <div className="flex flex-col mb-2 mt-1 items-center">
        <button
          title="Service Plan"
          onClick={() => {
            setPressedButtonId("2");
            router.push("/service_plan");
          }}
          className={`${baseBtn} w-12 h-10 mb-1.5 ${
            pressedButtonId === "2" ? activeBtn : ""
          }`}
        >
          <BiCalendarEvent size={22} />
        </button>
        <p className="text-xs text-center text-gray-400">Service Plan</p>
      </div>

      {/* Bottom/Organisation */}
      <div className="flex flex-col mb-2 mt-1 items-center">
        <button
          title="Organisation"
          onClick={() => {
            setPressedButtonId("org");
            router.push("/organisation"); // change to /profile if you have a profile page
          }}
          className={`${baseBtn} w-10 h-10 mb-2 ${
            pressedButtonId === "10" ? activeBtn : ""
          }`}
        >
          <FiBriefcase size={22} />
        </button>
        <p className="text-xs text-center text-gray-400">Organisation</p>
      </div>

      {/* Settings */}
      <div className="flex-col mb-2 mt-1 items-center">
        <button
          title="Settings"
          onClick={() => {
            setPressedButtonId("9");
            router.push("/settings");
          }}
          className={`${baseBtn} w-10 h-10 mb-2 ${
            pressedButtonId === "9" ? activeBtn : ""
          }`}
        >
          <FiSettings size={22} />
        </button>
        <p className="text-xs text-center text-gray-400">Settings</p>
      </div>
    </div>
  );
};
