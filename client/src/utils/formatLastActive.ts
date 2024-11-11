export default function formatLastActive(lastActive: string): string {
  const date = new Date(lastActive);
  const now = new Date();

  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }

  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
  };
  return date.toLocaleDateString(undefined, options);
}
