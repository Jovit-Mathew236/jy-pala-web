// ParishIcon.tsx (or directly in SearchBar.tsx)
export const ParishIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className || "w-5 h-5"} // Default size if not provided
  >
    <path d="M12 3L3 9V21H9V15H15V21H21V9L12 3ZM11.5 6.5H12.5V9.5H15.5V10.5H12.5V13.5H11.5V10.5H8.5V9.5H11.5V6.5Z" />
  </svg>
);

// ForaneIconOptionA.tsx (or directly in SearchBar.tsx)
export const ForaneIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className || "w-5 h-5"}
  >
    <path d="M2 20V10L6 7L10 10V20H2ZM3 18H9V11L6 8.5L3 11V18Z" />{" "}
    {/* Left small building */}
    <path d="M12 20V7L16 4L20 7V20H12ZM13 18H19V8L16 5.5L13 8V18Z" />{" "}
    {/* Central larger building */}
    <path d="M20.5 20V15L22 14V20H20.5Z" />{" "}
    {/* Small hint of another on right */}
  </svg>
);
