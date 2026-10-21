import { Icon } from "@/components/ui/icon";
import { Avatar } from "@/components/ui/primitives";
import type { Employee } from "@/types/api";

export function EmployeesTable({ employees, onSelect }: { employees: Employee[]; onSelect: (e: Employee) => void }) {
  return (
    <div className="table-wrap">
      <table className="fit-mobile">
        <thead>
          <tr><th>Employee</th><th className="col-optional">Department</th><th className="col-optional">Position</th><th className="col-optional">Team Lead</th><th className="col-optional">Leave balance</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr>
        </thead>
        <tbody>
          {employees.map((e) => (
            <tr key={e.name}>
              <td>
                <div className="employee-cell">
                  <Avatar initials={e.initials} size="small" />
                  <span><strong>{e.name}</strong><small>{e.name.toLowerCase().replace(" ", ".")}@sirisoft.co.th</small></span>
                </div>
              </td>
              <td className="col-optional">{e.department}</td>
              <td className="col-optional">{e.role}</td>
              <td className="col-optional">{e.lead}</td>
              <td className="col-optional"><strong>{e.leave}</strong></td>
              <td><span className={`employment-status ${e.status.toLowerCase()}`}>{e.status}</span></td>
              <td><button className="more-btn" onClick={() => onSelect(e)} aria-label={`View ${e.name}’s profile`} title="View profile"><Icon name="arrow" /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
