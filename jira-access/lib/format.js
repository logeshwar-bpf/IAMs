/**
 * Safely extracts initials from a full name.
 * Handles single names, empty strings, and long names.
 */
export const getInitials = (name) => {
  if (!name || typeof name !== "string") return "AD";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AD";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Null-safe query matching for search filters.
 */
export const matchesQuery = (haystack, needle) => {
  if (!needle || !needle.trim()) return true;
  if (!haystack) return false;
  return String(haystack).toLowerCase().includes(needle.toLowerCase().trim());
};

/**
 * Client-safe date and time formatting to prevent SSR hydration mismatches.
 */
export const formatTimestamp = (isoString) => {
  if (!isoString) return "—";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return (
      date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) +
      " • " +
      date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    );
  } catch {
    return isoString;
  }
};
