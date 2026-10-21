# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Internal staff of SIRISOFT. The product is used inside the company, not sold to other organisations.

- **Employee**: logs daily and weekly time against projects and tasks, requests overtime and leave.
- **Team Lead**: reviews and approves the team's time sheets, OT and leave; sees who is working, remote or on leave.
- **HR / Admin**: keeps employee records and settings, relies on submitted time being accurate.
- **Management**: reads reports and the overall picture of the company.

## Product Purpose

One internal system for time sheets, overtime, leave, team approvals, employee records and reports. Success means all four jobs are done well at once:

- logging time is fast enough that employees do it on time;
- approvals are quick for Team Leads;
- the recorded data (billable vs internal hours, leave, OT) is accurate enough for HR to rely on;
- Management gets the reports it needs without asking someone to compile them.

## Positioning

Built for SIRISOFT's own workflow rather than a generic HR suite: time is logged per project and task with Billable / Internal / Leave tags, time sheets have a weekly status (Draft → Submitted → Approved / Rejected), and each screen is scoped to the four roles above.

## Operating Context

- Employees log time during or at the end of the working day and submit by week; company holidays are part of the time sheet period.
- Team Leads process a queue of pending OT requests and time sheets.
- Employees must be able to log time and request leave from a phone as well as a desktop.

## Capabilities and Constraints

- Features: Dashboard, Time Sheet, OT Requests, Leave Management, My Team, Employees, Reports, Settings, History.
- Access is role-based (`Employee`, `Team Lead`, `HR / Admin`, `Management`); each route declares its allowed roles.
- Next.js App Router web app. No backend yet: data comes from mock functions that will later be replaced by real APIs.
- UI copy is English today. Thai language support is required in the future, so layouts and copy must tolerate Thai text and localisation.
- Must work on mobile as well as desktop.
- **Overtime** = hours over 8h on a workday, plus all hours on weekends and public holidays. Every page uses this rule.
- **Statuses**: anything waiting for a lead's decision (time sheet, OT, leave) is "Submitted"; then "Approved" or "Rejected". A week not yet sent is "Draft".
- **Leave** comes only from leave requests; approved requests appear in the time sheet as read-only leave days.
- Undecided: the backend/API, authentication, and payroll or billing integrations.

## Brand Commitments

- Name: SIRISOFT.
- The SIRISOFT green theme taken from the logo stays (brand green, teal and navy). Changing it is out of scope unless the user says otherwise.
- Logo assets: `public/logo-mark.png` (S mark), `public/logo.png` (full logo with wordmark), `src/app/icon.png` (favicon).

## Evidence on Hand

- Mock data only (`src/testing/mocks/db.ts`). There are no real usage numbers, user feedback or screenshots of production use; future work must not invent them.

## Product Principles

1. Logging time must be the fastest path in the product; anything that slows daily entry costs data accuracy.
2. Data correctness beats convenience: statuses, tags and totals must be unambiguous for HR and reports.
3. Each role sees what it needs to act on first: entries for employees, the approval queue for leads, figures for management.
4. Mobile and Thai text are first-class constraints, not later add-ons.
