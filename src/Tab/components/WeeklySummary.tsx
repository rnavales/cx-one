interface WeeklySummaryProps {
  workedHours: number;
  regularHours: number;
  otHours: number;
  projectsWorked: number;
  impactedHours: number;
}

export default function WeeklySummary({
  workedHours,
  regularHours,
  otHours,
  projectsWorked,
  impactedHours,
}: WeeklySummaryProps) {
  const productiveHours =
    Math.max(
      workedHours -
        impactedHours,
      0
    );

  return (
    <div className="compliance-card">
      <h2>
        This Week Summary
      </h2>

      <div className="stats-grid">
        <div className="card">
          <h3>
            Worked Hours
          </h3>

          <div className="value">
            {workedHours.toFixed(
              2
            )}
          </div>
        </div>

        <div className="card">
          <h3>
            Regular Hours
          </h3>

          <div className="value">
            {regularHours.toFixed(
              2
            )}
          </div>
        </div>

        <div className="card">
          <h3>
            OT Hours
          </h3>

          <div className="value ot-value">
            {otHours.toFixed(
              2
            )}
          </div>
        </div>

        <div className="card">
          <h3>
            Projects Supported
          </h3>

          <div className="value">
            {projectsWorked}
          </div>
        </div>

        <div className="card">
          <h3>
            Impacted Hours
          </h3>

          <div className="value">
            {impactedHours.toFixed(
              2
            )}
          </div>
        </div>

        <div className="card">
          <h3>
            Productive Hours
          </h3>

          <div className="value">
            {productiveHours.toFixed(
              2
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// END OF FILE