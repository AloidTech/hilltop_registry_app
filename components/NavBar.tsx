"use client";
import {
  BiCalendarEvent,
  BiFilterAlt,
  BiSearch,
  BiSolidCalendarEvent,
} from "react-icons/bi";

import { MdMenu } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { useState } from "react";
import { RiProfileFill, RiProfileLine } from "react-icons/ri";
import Link from "next/link";
import { redirect } from "next/navigation";

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
  return (
    <div className="flex justify-center gap-10 items-center w-full py-1 px-5 bg-neutral-800">
      <div className="flex-col mb-3 mt-1">
        <Link href={"/"}>
          <button
            onClick={() => setPressedButtonId("1")}
            className={`px-5 py-1 mb-1.5 ${
              pressedButtonId == "1" ? "bg-neutral-700/60" : "bg-neutral-800"
            }  hover:bg-neutral-700/60 rounded-4xl`}
          >
            <CgProfile size={27} />
          </button>
        </Link>
        <p className="text-sm  text-center"> Chat</p>
      </div>

      <div className="flex-col mb-3 mt-1 ">
        <Link href={"/service_plan"}>
          <button
            onClick={() => setPressedButtonId("2")}
            className={`px-5 py-1 mb-1.5 ${
              pressedButtonId == "2" ? "bg-neutral-700/60" : "bg-neutral-800"
            }  hover:bg-neutral-700/60 rounded-4xl`}
          >
            <BiCalendarEvent size={27} />
          </button>
        </Link>

        <p className="text-sm text-center"> Service Plan</p>
      </div>
    </div>
  );
};
