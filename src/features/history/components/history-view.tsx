"use client";

import { useMemo, useState } from "react";

import { Icon } from "@/components/ui/icon";
import { PageHeader, StatusBadge } from "@/components/ui/primitives";
import type { HistoryRecord } from "@/features/history/api/get-history";
import { useRole } from "@/lib/authorization";
import { useDecisions } from "@/lib/decisions";
import { downloadCsv, toCsv } from "@/lib/csv";

const TYPES = [
  { label: "All record types", value: "" },
  { label: "OT Requests", value: "OT Request" },
  { label: "Time Sheets", value: "Time Sheet" },
  { label: "Leave Requests", value: "Leave Request" },
];

type Props = {
  records: HistoryRecord[];
  /** Approval ids and the History record each one updates. */
  approvalLinks: { id: number; historyId: string }[];
};

export function HistoryView({ records: rawRecords, approvalLinks }: Props) {
  const { role } = useRole();
  const { decided } = useDecisions();
  const allRecords = useMemo(() => {
    const outcome = new Map(approvalLinks.flatMap((l) => (decided.has(l.id) ? [[l.historyId, decided.get(l.id)!] as const] : [])));
    return rawRecords.map((r) => (outcome.has(r.id) ? { ...r, status: outcome.get(r.id)! } : r));
  }, [rawRecords, approvalLinks, decided]);
  // Employees only see their own records; leads, HR and management see everyone's.
  const ownOnly = role === "Employee";
  const records = useMemo(() => (ownOnly ? allRecords.filter((r) => r.employee === "You") : allRecords), [allRecords, ownOnly]);
  const statuses = ["All statuses", ...new Set(records.map((r) => r.status))];

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [type, setType] = useState("");

  const rows = useMemo(
    () =>
      records.filter(
        (r) =>
          (r.employee + r.project + r.id).toLowerCase().includes(query.toLowerCase()) &&
          (status === "All statuses" || r.status === status) &&
          (!type || r.type === type),
      ),
    [records, query, status, type],
  );

  const exportCsv = () =>
    downloadCsv(
      "history.csv",
      toCsv([
        ["Record ID", "Employee", "Type", "Date / period", "Project", "Hours", "Status"],
        ...rows.map((r) => [r.id, r.employee, r.type, r.period, r.project, r.hours, r.status]),
      ]),
    );

  return (
    <>
      <PageHeader
        title="History"
        subtitle={ownOnly ? "Search and review your overtime requests and time sheet records." : "Search and review all overtime requests and time sheet records."}
        action={<button className="secondary-btn" onClick={exportCsv} disabled={!rows.length}><Icon name="download" size={17} />Export CSV</button>}
      />
      <section className="panel">
        <div className="filters">
          <div className="search-field">
            <Icon name="search" size={18} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search records, projects, or employees…" aria-label="Search records" />
          </div>
          <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Record type">
            {TYPES.map((t) => <option key={t.label} value={t.value}>{t.label}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
            {statuses.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        {rows.length ? (
          <div className="table-wrap">
            <table className="fit-mobile">
              <thead>
                <tr><th>Record ID</th><th>Employee</th><th className="col-optional">Type</th><th className="col-optional">Date / period</th><th className="col-optional">Project</th><th>Hours</th><th>Status</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td><strong className="record-id">{r.id}</strong></td>
                    <td><strong>{r.employee}</strong></td>
                    <td className="col-optional">{r.type}</td>
                    <td className="col-optional">{r.period}</td>
                    <td className="col-optional">{r.project}</td>
                    <td><strong>{r.hours}</strong></td>
                    <td><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>No records match</h3>
            <p>Try a different search, type or status.</p>
          </div>
        )}
        <div className="pagination">
          <p>Showing {rows.length} of {records.length} records</p>
        </div>
      </section>
    </>
  );
}
