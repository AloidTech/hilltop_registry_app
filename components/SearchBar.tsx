"use client";
import { useState } from "react";
import { BiSearch } from "react-icons/bi";

export const SearchBar1 = () => {
  const [searchTerm, setSearchTerm] = useState("");
  return (
    <div className="relative mb-4">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <BiSearch className="text-gray-400 w-4 h-4" />
      </div>
      <input
        type="text"
        placeholder="Search members"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="
        flex text-sm pl-10  p-3 gap-2 border-b-1 border-neutral-400 
        items-center rounded-md h-8 w-full bg-[rgb(61,62,61)]
        focus:outline-0 focus:border-b-3 focus:bg-neutral-800 focus:border-green-600
        "
      />
    </div>
  );
};
