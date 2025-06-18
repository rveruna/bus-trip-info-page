export function formatTime(input: string | Date) {
  const date = typeof input === "string" ? new Date(input) : input;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
