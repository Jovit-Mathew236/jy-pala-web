"use client";

import { ForaneIcon, ParishIcon } from "@/lib/icons/icons";
import { usePathname } from "next/navigation";
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  searchType: "parish" | "forane";
  onSearchTypeChange: (type: "parish" | "forane") => void;
}

export function SearchBar({
  value,
  onChange,
  placeholder,
  searchType,
  onSearchTypeChange,
}: SearchBarProps) {
  const pathname = usePathname();
  // Styling for active toggle: medium-grey background, white text (as per image)
  const activeClasses = "bg-gray-400 text-white px-1 pr-2"; // px-2.5 for horizontal padding
  // Styling for inactive toggle: transparent background, icon only
  const inactiveClasses = "bg-transparent hover:bg-gray-100 w-7"; // w-7 to make it a square button for the icon

  return (
    <div className="flex items-center w-full bg-white border border-gray-300 rounded-full shadow-sm focus-within:ring-1 focus-within:ring-offset-1 focus-within:ring-gray-400 h-10">
      {/* Optional: Add a search icon on the left of the input if desired */}
      {/* <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 ml-3" /> */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-grow pl-4 pr-2 h-full text-sm text-gray-700 bg-transparent focus:outline-none placeholder-gray-400"
      />
      {/* Container for filter toggles */}
      {pathname === "/admin" && (
        <div className="flex items-center pr-1.5 space-x-1">
          <button
            onClick={() => onSearchTypeChange("forane")}
            className={`flex items-center justify-center rounded-full transition-all duration-200 ease-in-out group h-7
            ${searchType === "forane" ? activeClasses : inactiveClasses}
          `}
            aria-pressed={searchType === "forane"}
            aria-label="Filter by Forane"
          >
            <ForaneIcon className="rounded-full text-white bg-gray-500 p-1 w-5 h-5" />
            {searchType === "forane" && (
              <span className="ml-1.5 text-xs font-medium whitespace-nowrap">
                Forane
              </span>
            )}
          </button>
          {/* Parish Toggle Button */}
          <button
            onClick={() => onSearchTypeChange("parish")}
            className={`flex items-center justify-center rounded-full transition-all duration-200 ease-in-out group h-7
            ${searchType === "parish" ? activeClasses : inactiveClasses}
          `}
            aria-pressed={searchType === "parish"}
            aria-label="Filter by Parish"
          >
            <ParishIcon className="rounded-full text-white bg-gray-500 p-1 w-5 h-5" />
            {searchType === "parish" && (
              <span className="ml-1.5 text-xs font-medium whitespace-nowrap">
                Parish
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
