import type { Plan } from "@/types";

export const LIMITS = {
  free: { subjects: 5, decks: 10, files: 20, storageMb: 500, historyDays: 7, monthView: false, retention: false, export: false },
  plus: { subjects: Infinity, decks: Infinity, files: Infinity, storageMb: 10240, historyDays: Infinity, monthView: true, retention: true, export: true },
} as const;

export const limitsFor = (plan: Plan) => LIMITS[plan];
