"use client";

import { useState, type CSSProperties } from "react";

import { Icon } from "@/components/ui/icon";
import { Avatar, Field, PageHeader } from "@/components/ui/primitives";
import type { EmployeeSummaryRow, ReportMetric, TeamHours } from "@/features/reports/api/get-reports";
import { downloadCsv, toCsv } from "@/lib/csv";
import type { Employee } from "@/types/api";

type Props = {
  /** Approved leave days per type this year: Annual, Sick, Personal (in that order, matching the donut colours). */
  leaveByType: { type: string; days: number }[];
  metrics: ReportMetric[];
  hoursByTeam: TeamHours[];
  employees: Employee[];
  summaryRows: EmployeeSummaryRow[];
};

export function ReportsView({ leaveByType, metrics, hoursByTeam, employees, summaryRows }: Props) {
  const leaveUsed = leaveByType.reduce((sum, l) => sum + l.days, 0);
  const leaveTotal = leaveUsed || 1;
  const scale = Math.max(100, ...hoursByTeam.map((t) => t.regular + t.overtime));
  const [person, setPerson] = useState("All employees");
  const [team, setTeam] = useState("All teams");

  const rows = summaryRows
    .map((row) => ({ ...row, employee: employees.find((e) => e.name === row.name)! }))
    .filter((r) => r.employee && (person === "All employees" || r.employee.name === person) && (team === "All teams" || r.employee.department === team));
  const listed = employees.filter((e) => summaryRows.some((r) => r.name === e.name));
  const teams = [...new Set(listed.map((e) => e.department))].sort();

  const exportCsv = () =>
    downloadCsv(
      "employee-summary-may-2025.csv",
      toCsv([
        ["Employee", "Team", "Regular hours", "OT hours", "Leave used (days)", "Completion %"],
        ...rows.map((r) => [r.employee.name, r.employee.department, r.regular, r.overtime, r.leaveDays, r.completion]),
      ]),
    );

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Analyze workforce attendance, time, leave, and project activity."
        action={<button className="secondary-btn" onClick={exportCsv} disabled={!rows.length}><Icon name="download" size={17} />Export report</button>}
      />

      <section className="panel report-filters">
        <div className="filter-label">
          <Icon name="filter" />
          <span><strong>Report filters</strong><small>Filter the employee summary</small></span>
        </div>
        <Field label="Employee">
          <select value={person} onChange={(e) => setPerson(e.target.value)}>
            <option>All employees</option>
            {listed.map((e) => <option key={e.name}>{e.name}</option>)}
          </select>
        </Field>
        <Field label="Team">
          <select value={team} onChange={(e) => setTeam(e.target.value)}>
            <option>All teams</option>
            {teams.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Period">
          <select disabled><option>May 2025, to date</option></select>
        </Field>
      </section>

      <div className="report-metrics">
        {metrics.map((m) => (
          <div className="summary-card" key={m.label}>
            <div className={`summary-icon ${m.tone}`}><Icon name={m.icon} /></div>
            <p className="eyebrow">{m.label}</p>
            <strong>{m.value}</strong>
            <small>{m.note}</small>
          </div>
        ))}
      </div>

      <div className="report-grid">
        <section className="panel report-chart">
          <div className="panel-head bordered">
            <div><h2>Team capacity used</h2><p>Regular and overtime hours as a share of capacity, this month</p></div>
          </div>
          <div className="horizontal-chart">
            {hoursByTeam.map((t) => (
              <div key={t.team}>
                <span>{t.team}</span>
                <i role="img" aria-label={`${t.team}: ${t.regular}% regular, ${t.overtime}% overtime`}>
                  <b style={{ width: `${(t.regular / scale) * 100}%` }} /><em style={{ width: `${(t.overtime / scale) * 100}%` }} />
                </i>
                <strong>{t.regular + t.overtime}%</strong>
              </div>
            ))}
          </div>
          <div className="chart-legend report-legend">
            <span><i className="legend-green" />Regular hours</span>
            <span><i className="legend-light" />Overtime</span>
          </div>
        </section>
        <section className="panel">
          <div className="panel-head bordered"><div><h2>Leave by type</h2><p>Approved leave requests this year</p></div></div>
          <div className="donut-wrap">
            <div
              className="donut"
              role="img"
              aria-label={leaveByType.map((l) => `${l.type}: ${l.days} days`).join(", ")}
              style={{ "--a": `${(leaveByType[0]?.days ?? 0) / leaveTotal * 100}%`, "--b": `${((leaveByType[0]?.days ?? 0) + (leaveByType[1]?.days ?? 0)) / leaveTotal * 100}%` } as CSSProperties}
            >
              <span><strong>{leaveUsed}</strong>days used</span>
            </div>
            <div className="donut-legend">
              {leaveByType.map((l) => <span key={l.type}><i />{l.type} <strong>{l.days}</strong></span>)}
            </div>
          </div>
        </section>
      </div>

      <section className="panel report-table">
        <div className="panel-head bordered">
          <div><h2>Employee summary</h2><p>May 1 – 16, 2025 (month to date)</p></div>
        </div>
        {rows.length ? (
          <div className="table-wrap">
            <table className="fit-mobile">
              <thead>
                <tr><th>Employee</th><th className="col-optional">Team</th><th>Regular hours</th><th className="col-optional">OT hours</th><th className="col-optional">Leave used</th><th>Completion</th></tr>
              </thead>
              <tbody>
                {rows.map(({ employee: e, ...row }) => (
                  <tr key={e.name}>
                    <td><div className="employee-cell"><Avatar initials={e.initials} size="small" /><strong>{e.name}</strong></div></td>
                    <td className="col-optional">{e.department}</td>
                    <td><strong>{+row.regular.toFixed(1)}h</strong></td>
                    <td className="col-optional">{+row.overtime.toFixed(1)}h</td>
                    <td className="col-optional">{row.leaveDays} {row.leaveDays === 1 ? "day" : "days"}</td>
                    <td>
                      <strong>{row.completion}%</strong>
                      <span className={`mini-progress ${row.completion >= 100 ? "full" : ""}`}><b style={{ width: `${row.completion}%` }} /></span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state"><h3>No employees match</h3><p>Try another employee or team.</p></div>
        )}
      </section>
    </>
  );
}
