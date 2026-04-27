import { contactCards } from "@/lib/ubik-data";

export function getInitials(name: string) {
  const parts = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function findContactCard(name: string) {
  const normalized = name.trim().toLowerCase();
  return contactCards.find((contact) => contact.name.trim().toLowerCase() === normalized);
}
