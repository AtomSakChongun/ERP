"use client";

import { useState } from "react";

import { Icon, type IconName } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/primitives";
import { EmployeeProfileModal } from "@/features/employees/components/employee-profile-modal";
import { EmployeesTable } from "@/features/employees/components/employees-table";
import type { Employee } from "@/types/api";

type Stat = { label: string; value: string; note: string; icon: IconName };

export function EmployeesView({ employees, stats }: { employees: Employee[]; stats: readonly Stat[] }) {
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("All departments");
  const [status, setStatus] = useState("All statuses");
  const [selected, setSelected] = useState<Employee | null>(null);
  const departments = [...new Set(employees.map((e) => e.department))].sort();
  const visible = employees.filter(
    (e) =>
      (e.name + e.department + e.role).toLowerCase().includes(query.toLowerCase()) &&
      (department === "All departments" || e.department === department) &&
      (status === "All statuses" || e.status === status),
  );

  return (
    <>
      <PageHeader
        title="Employees"
        subtitle="Manage employee profiles, teams, and employment information."
        action={
          <button className="primary-btn" disabled title="Coming soon">
            <Icon name="plus" size={18} />Add employee
          </button>
        }
      />
      <div className="employee-summary">
        {stats.map((s) => (
          <div key={s.label}>
            <span><Icon name={s.icon} /></span>
            <p>{s.label}<strong>{s.value}</strong></p>
            <small>{s.note}</small>
          </div>
        ))}
      </div>
      <section className="panel">
        <div className="filters">
          <div className="search-field">
            <Icon name="search" size={18} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search employees…" aria-label="Search employees" />
          </div>
          <select value={department} onChange={(e) => setDepartment(e.target.value)} aria-label="Department">
            <option>All departments</option>
            {departments.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Employment status">
            <option>All statuses</option><option>Active</option><option>Probation</option>
          </select>
        </div>
        {visible.length ? (
          <EmployeesTable employees={visible} onSelect={setSelected} />
        ) : (
          <div className="empty-state">
            <h3>No employees match</h3>
            <p>Try a different name, department or status.</p>
          </div>
        )}
        <div className="pagination">
          <p>Showing {visible.length} of {employees.length} employees</p>
        </div>
      </section>
      {selected && <EmployeeProfileModal employee={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
