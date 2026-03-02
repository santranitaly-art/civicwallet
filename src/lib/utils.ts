import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatHours(hours: number | string): string {
  const h = typeof hours === "string" ? parseFloat(hours) : hours;
  if (h >= 1) return `${h.toFixed(1)}h`;
  return `${Math.round(h * 60)}min`;
}

export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
