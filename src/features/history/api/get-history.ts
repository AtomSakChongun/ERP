import { historyRows } from "@/testing/mocks/db";
import type { Status } from "@/types/api";

export type HistoryRecord = {
  id: string;
  employee: string;
  type: string;
  period: string;
  project: string;
  hours: string;
  status: Status;
};

export async function getHistory(): Promise<HistoryRecord[]> {
  return [...historyRows];
}
