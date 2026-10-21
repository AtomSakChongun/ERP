export type LeavePolicy = { name: string; allowance: string; rule: string; active: boolean };

export async function getLeavePolicies(): Promise<LeavePolicy[]> {
  return [
    { name: "Annual Leave", allowance: "18 days", rule: "Paid · Accrues monthly", active: true },
    { name: "Sick Leave", allowance: "10 days", rule: "Paid · Medical proof after 2 days", active: true },
    { name: "Personal Leave", allowance: "3 days", rule: "Paid · Manager approval", active: true },
    { name: "Unpaid Leave", allowance: "No limit", rule: "Unpaid · HR approval required", active: false },
  ];
}
