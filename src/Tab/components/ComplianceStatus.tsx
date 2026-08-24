type LMSStatus =
  | "All Caught Up"
  | "Training Due Soon"
  | "Overdue Training";

type ConcurStatus =
  | "No Expenses"
  | "Pending Card Transaction"
  | "Draft"
  | "Submitted"
  | "Approved";

type ComplianceStatusType =
  | "Submitted"
  | "Not Submitted";

type SafetyWalkStatus =
  | "Submitted"
  | "Not Submitted"
  | "Not Deployed On-Site";

interface Props {
  timesheetStatus: ComplianceStatusType;
  lmsStatus: LMSStatus;
  concurStatus: ConcurStatus;
  safetyWalkStatus: SafetyWalkStatus;
  updatedDate?: string;
}

export default function ComplianceStatus({
  timesheetStatus,
  lmsStatus,
  concurStatus,
  safetyWalkStatus,
  updatedDate,
}: Props) {
  const formattedDate = updatedDate
    ? new Date(updatedDate).toLocaleString()
    : "Not Available";

  return (
    <div className="compliance-card">
      <h2>
        Current Status
      </h2>

      <div className="status-row">
        <span>
          SAP Timesheet
        </span>

        <span>
          {timesheetStatus ===
          "Submitted"
            ? "✅"
            : "❌"}
        </span>
      </div>

      <div className="status-row">
        <span>
          LMS
        </span>

        <span>
          {lmsStatus ===
          "All Caught Up"
            ? "✅"
            : lmsStatus ===
                "Training Due Soon"
              ? "⚠️"
              : "❌"}
        </span>
      </div>

      <div className="status-row">
        <span>
          Concur
        </span>

        <span>
          {concurStatus ===
            "Approved" ||
          concurStatus ===
            "Submitted"
            ? "✅"
            : concurStatus ===
                "Pending Card Transaction"
              ? "⏳"
              : "⚠️"}
        </span>
      </div>

      <div className="status-row">
        <span>
          Safety Walk
        </span>

        <span>
          {safetyWalkStatus ===
          "Submitted"
            ? "✅"
            : safetyWalkStatus ===
                "Not Deployed On-Site"
              ? "➖"
              : "❌"}
        </span>
      </div>

      <hr />

      <div className="status-row">
        <span>
          Last Updated
        </span>

        <strong>
          {formattedDate}
        </strong>
      </div>
    </div>
  );
}

// END OF FILE