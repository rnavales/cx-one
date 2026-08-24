interface Props {
  totalRecords: number;

  timesheetSubmitted: number;

  lmsCompliant: number;

  concurCompliant: number;

  safetyWalkCompliant: number;

  safetyWalkApplicable: number;
}

export default function ComplianceSummary({
  totalRecords,
  timesheetSubmitted,
  lmsCompliant,
  concurCompliant,
  safetyWalkCompliant,
  safetyWalkApplicable,
}: Props) {
  return (
    <div className="compliance-card">
      <h2>
        Compliance Summary
      </h2>

      <div className="entry-row">
        <span>
          SAP Timesheet
        </span>

        <strong>
          {timesheetSubmitted} / {totalRecords}
        </strong>
      </div>

      <div className="entry-row">
        <span>
          LMS
        </span>

        <strong>
          {lmsCompliant} / {totalRecords}
        </strong>
      </div>

      <div className="entry-row">
        <span>
          Concur
        </span>

        <strong>
          {concurCompliant} / {totalRecords}
        </strong>
      </div>

      <div className="entry-row">
        <span>
          Safety Walk
        </span>

        <strong>
          {safetyWalkCompliant} / {safetyWalkApplicable}
        </strong>
      </div>
    </div>
  );
}

// END OF FILE