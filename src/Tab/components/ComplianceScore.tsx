interface Props {
  completedChecks: number;
  totalChecks: number;
}

export default function ComplianceScore({
  completedChecks,
  totalChecks,
}: Props) {
  return (
    <div className="stats-grid">
      <div className="card">
        <h3>
          Compliance Score
        </h3>

        <div className="value">
          {completedChecks}/
          {totalChecks}
        </div>
      </div>
    </div>
  );
}

// END OF FILE