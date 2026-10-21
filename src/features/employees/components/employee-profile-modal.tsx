"use client";

import { Modal, ModalHeader } from "@/components/ui/modal";
import { Avatar } from "@/components/ui/primitives";
import type { Employee } from "@/types/api";

export function EmployeeProfileModal({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  return (
    <Modal onClose={onClose} className="employee-modal">
      <ModalHeader title="Employee profile" onClose={onClose} />
      <div className="profile-hero">
        <Avatar initials={employee.initials} className="profile-avatar" />
        <div>
          <h2>{employee.name}</h2>
          <p>{employee.role} · {employee.department}</p>
          <div className="profile-tags">
            <span className={`employment-status ${employee.status.toLowerCase()}`}>{employee.status === "Active" ? "Active employee" : "On probation"}</span>
            <span className={`availability ${employee.availability.toLowerCase().replace(" ", "-")}`}>{employee.availability} today</span>
          </div>
        </div>
      </div>
      <div className="review-details">
        <div><span>Team Lead</span><strong>{employee.lead}</strong></div>
        <div><span>Annual leave</span><strong>{employee.leave} remaining</strong></div>
      </div>
      <div className="modal-footer">
        <button className="secondary-btn" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}
