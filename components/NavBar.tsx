"use client";
import { BiCalendarEvent } from "react-icons/bi";

import { MdMenu } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";

export function NavBarDeskt() {
  const [pressedButtonId, setPressedButtonId] = useState("1");

  return (
    <div className="flex-col justify-items-center h-screen w-12 p-1 bg-neutral-800">
      <button
        className={`my-3 mx-0 px-2 py-1.5 hover:bg-neutral-700/60  rounded-sm`}
      >
        <MdMenu size={23} />
      </button>

      <button
        onClick={() => {
          setPressedButtonId("1");
          redirect("/");
        }}
        className={`mt-3 px-2 py-1.5 ${
          pressedButtonId == "1" ? "bg-neutral-700/60" : "bg-neutral-800"
        }  hover:bg-neutral-700/60 rounded-sm`}
      >
        <CgProfile size={24} />
      </button>

      <button
        onClick={() => {
          setPressedButtonId("2");
          redirect("/service_plan");
        }}
        className={`my-1 px-2 py-1.5 ${
          pressedButtonId == "2" ? "bg-neutral-700/60" : "bg-neutral-800"
        }  hover:bg-neutral-700/60 rounded-sm`}
      >
        <BiCalendarEvent size={23} />
      </button>
    </div>
  );
}

export const NavBarMobile = () => {
  const [pressedButtonId, setPressedButtonId] = useState("");
  const router = useRouter();

  return (
    <div className="flex justify-center gap-10 items-center w-full py-2 px-5 bg-neutral-800 border-t border-neutral-700/50">
      <div className="flex-col mb-2 mt-1">
        <button
          onClick={() => {
            setPressedButtonId("1");
            router.push("/");
          }}
          className={`px-5 py-2 mb-1.5 ${
            pressedButtonId == "1" ? "bg-neutral-700/60" : "bg-neutral-800"
          } hover:bg-neutral-700/60 rounded-xl`}
        >
          <CgProfile size={24} />
        </button>
        <p className="text-xs text-center text-gray-400">Members</p>
      </div>

      <div className="flex-col mb-2 mt-1">
        <button
          onClick={() => {
            setPressedButtonId("2");
            router.push("/service_plan");
          }}
          className={`px-5 py-2 mb-1.5 ${
            pressedButtonId == "2" ? "bg-neutral-700/60" : "bg-neutral-800"
          } hover:bg-neutral-700/60 rounded-xl`}
        >
          <BiCalendarEvent size={24} />
        </button>
        <p className="text-xs text-center text-gray-400">Service Plan</p>
      </div>
    </div>
  );
};
