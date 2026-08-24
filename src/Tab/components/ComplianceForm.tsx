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

type ComplianceStatus =
  | "Submitted"
  | "Not Submitted";

type SafetyWalkStatus =
  | "Submitted"
  | "Not Submitted"
  | "Not Deployed On-Site";

interface Props {
  timesheetStatus: ComplianceStatus;

  setTimesheetStatus: (
    value: ComplianceStatus
  ) => void;

  lmsStatus: LMSStatus;

  setLmsStatus: (
    value: LMSStatus
  ) => void;

  concurStatus: ConcurStatus;

  setConcurStatus: (
    value: ConcurStatus
  ) => void;

  safetyWalkStatus: SafetyWalkStatus;

  setSafetyWalkStatus: (
    value: SafetyWalkStatus
  ) => void;
}

export default function ComplianceForm({
  timesheetStatus,
  setTimesheetStatus,
  lmsStatus,
  setLmsStatus,
  concurStatus,
  setConcurStatus,
  safetyWalkStatus,
  setSafetyWalkStatus,
}: Props) {
  return (
    <div className="compliance-card">
      <h2>
        Weekly Compliance Check
      </h2>

      <div className="form-group">
        <label>
          SAP Timesheet
        </label>

        <select
          value={timesheetStatus}
          onChange={(event) =>
            setTimesheetStatus(
              event.target
                .value as ComplianceStatus
            )
          }
        >
          <option>
            Submitted
          </option>

          <option>
            Not Submitted
          </option>
        </select>
      </div>

      <div className="form-group">
        <label>
          LMS
        </label>

        <select
          value={lmsStatus}
          onChange={(event) =>
            setLmsStatus(
              event.target
                .value as LMSStatus
            )
          }
        >
          <option>
            All Caught Up
          </option>

          <option>
            Training Due Soon
          </option>

          <option>
            Overdue Training
          </option>
        </select>
      </div>

      <div className="form-group">
        <label>
          Concur
        </label>

        <select
          value={concurStatus}
          onChange={(event) =>
            setConcurStatus(
              event.target
                .value as ConcurStatus
            )
          }
        >
          <option>
            No Expenses
          </option>

          <option>
            Pending Card Transaction
          </option>

          <option>
            Draft
          </option>

          <option>
            Submitted
          </option>

          <option>
            Approved
          </option>
        </select>
      </div>

      <div className="form-group">
        <label>
          Safety Walk
        </label>

        <select
          value={
            safetyWalkStatus
          }
          onChange={(event) =>
            setSafetyWalkStatus(
              event.target
                .value as SafetyWalkStatus
            )
          }
        >
          <option>
            Submitted
          </option>

          <option>
            Not Submitted
          </option>

          <option>
            Not Deployed On-Site
          </option>
        </select>
      </div>
    </div>
  );
}

// END OF FILE