interface DashboardStatsProps {
  totalHours: number;
  totalOTHours: number;
  totalProjects: number;
  totalEntries: number;
  remoteSupportCount: number;
  onsiteCount: number;

  totalImpactedHours?: number;
  totalProductiveHours?: number;
  topProject?: string;
  topActivity?: string;
}

export default function DashboardStats({
  totalHours,
  totalOTHours,
  totalProjects,
  totalEntries,
  remoteSupportCount,
  onsiteCount,
  totalImpactedHours = 0,
  totalProductiveHours = 0,
  topProject = "-",
  topActivity = "-",
}: DashboardStatsProps) {
  return (
    <div className="stats-grid">
      <div className="card">
        <h3>Worked Hours</h3>

        <div className="value">
          {totalHours.toFixed(2)}
        </div>
      </div>

      <div className="card">
        <h3>OT Hours</h3>

        <div className="value ot-value">
          {totalOTHours.toFixed(2)}
        </div>
      </div>

      <div className="card">
        <h3>Projects Supported</h3>

        <div className="value">
          {totalProjects}
        </div>
      </div>

      <div className="card">
        <h3>Entries Logged</h3>

        <div className="value">
          {totalEntries}
        </div>
      </div>

      <div className="card">
        <h3>Remote Support</h3>

        <div className="value">
          {remoteSupportCount}
        </div>
      </div>

      <div className="card">
        <h3>On-Site Support</h3>

        <div className="value">
          {onsiteCount}
        </div>
      </div>

      <div className="card">
        <h3>Productive Hours</h3>

        <div className="value">
          {totalProductiveHours.toFixed(2)}
        </div>
      </div>

      <div className="card">
        <h3>Impacted Hours</h3>

        <div className="value">
          {totalImpactedHours.toFixed(2)}
        </div>
      </div>

      <div className="card">
        <h3>Top Project</h3>

        <div className="value">
          {topProject}
        </div>
      </div>

      <div className="card">
        <h3>Top Activity</h3>

        <div className="value">
          {topActivity}
        </div>
      </div>
    </div>
  );
}

// END OF FILE