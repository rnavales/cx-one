import {
  useMemo,
  useState,
} from "react";

import {
  getEntries,
} from "../data";

import type {
  TimeEntry,
} from "../data";

import useTeamsUser from "../hooks/useTeamsUser";

type FilterType =
  | "Today"
  | "Week"
  | "Month";

interface BreakdownItem {
  name: string;
  hours: number;
}

interface ProjectSummary {
  key: string;
  country: string;
  project: string;
  productType: string;
  pcsVendor: string;
  workedHours: number;
  regularHours: number;
  otHours: number;
  impactedHours: number;
  productiveHours: number;
  entryCount: number;
  phaseBreakdown: BreakdownItem[];
  activityBreakdown: BreakdownItem[];
  impactBreakdown: BreakdownItem[];
}

function getEntryDate(
  entry: TimeEntry
): Date {
  const dateValue =
    entry.workDate ||
    entry.createdDate.substring(
      0,
      10
    );

  return new Date(
    `${dateValue}T12:00:00`
  );
}

function getStartOfWeek(
  date: Date
): Date {
  const start = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const day = start.getDay();
  const daysFromMonday =
    day === 0 ? 6 : day - 1;

  start.setDate(
    start.getDate() -
      daysFromMonday
  );

  return start;
}

function getEndOfWeek(
  startOfWeek: Date
): Date {
  const end = new Date(
    startOfWeek
  );

  end.setDate(
    startOfWeek.getDate() + 6
  );

  end.setHours(
    23,
    59,
    59,
    999
  );

  return end;
}

function summarize(
  entries: TimeEntry[],
  getName: (
    entry: TimeEntry
  ) => string,
  getHours: (
    entry: TimeEntry
  ) => number
): BreakdownItem[] {
  const map = new Map<
    string,
    number
  >();

  entries.forEach((entry) => {
    const name =
      getName(entry) ||
      "Not Specified";

    map.set(
      name,
      (map.get(name) || 0) +
        getHours(entry)
    );
  });

  return Array.from(
    map.entries()
  )
    .map(([name, hours]) => ({
      name,
      hours,
    }))
    .sort(
      (first, second) =>
        second.hours -
        first.hours
    );
}

export default function ProjectUtilization() {
  const {
    employeeName,
  } = useTeamsUser();

  const [
    selectedFilter,
    setSelectedFilter,
  ] = useState<FilterType>(
    "Week"
  );

  const entries = getEntries();

  const filteredEntries =
    useMemo(() => {
      const today = new Date();

      const todayStart =
        new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );

      const weekStart =
        getStartOfWeek(today);

      const weekEnd =
        getEndOfWeek(
          weekStart
        );

      return entries.filter(
        (entry) => {
          if (
            entry.category !==
            "Project Work"
          ) {
            return false;
          }

          const entryDate =
            getEntryDate(entry);

          if (
            selectedFilter ===
            "Today"
          ) {
            return (
              entryDate.toDateString() ===
              todayStart.toDateString()
            );
          }

          if (
            selectedFilter ===
            "Week"
          ) {
            return (
              entryDate >= weekStart &&
              entryDate <= weekEnd
            );
          }

          return (
            entryDate.getMonth() ===
              today.getMonth() &&
            entryDate.getFullYear() ===
              today.getFullYear()
          );
        }
      );
    }, [
      entries,
      selectedFilter,
    ]);

  const projectSummaries =
    useMemo(() => {
      const projectMap =
        new Map<
          string,
          TimeEntry[]
        >();

      filteredEntries.forEach(
        (entry) => {
          const key =
            `${entry.country} - ${entry.project}`;

          const current =
            projectMap.get(key) || [];

          current.push(entry);
          projectMap.set(
            key,
            current
          );
        }
      );

      return Array.from(
        projectMap.entries()
      )
        .map(
          ([key, projectEntries]): ProjectSummary => {
            const firstEntry =
              projectEntries[0];

            const workedHours =
              projectEntries.reduce(
                (total, entry) =>
                  total +
                  Number(
                    entry.hours || 0
                  ),
                0
              );

            const regularHours =
              projectEntries.reduce(
                (total, entry) =>
                  total +
                  Number(
                    entry.regularHours ||
                      0
                  ),
                0
              );

            const otHours =
              projectEntries.reduce(
                (total, entry) =>
                  total +
                  Number(
                    entry.otHours || 0
                  ),
                0
              );

            const impactedHours =
              projectEntries.reduce(
                (total, entry) =>
                  total +
                  Number(
                    entry.impactedHours ||
                      0
                  ),
                0
              );

            return {
              key,
              country:
                firstEntry.country,
              project:
                firstEntry.project,
              productType:
                firstEntry.productType ||
                "Not Specified",
              pcsVendor:
                firstEntry.pcsVendor ||
                "Not Specified",
              workedHours,
              regularHours,
              otHours,
              impactedHours,
              productiveHours:
                Math.max(
                  workedHours -
                    impactedHours,
                  0
                ),
              entryCount:
                projectEntries.length,
              phaseBreakdown:
                summarize(
                  projectEntries,
                  (entry) =>
                    entry.phase,
                  (entry) =>
                    Number(
                      entry.hours || 0
                    )
                ),
              activityBreakdown:
                summarize(
                  projectEntries,
                  (entry) =>
                    entry.activity,
                  (entry) =>
                    Number(
                      entry.hours || 0
                    )
                ),
              impactBreakdown:
                summarize(
                  projectEntries.filter(
                    (entry) =>
                      entry.impactCategory &&
                      entry.impactCategory !==
                        "None" &&
                      Number(
                        entry.impactedHours ||
                          0
                      ) > 0
                  ),
                  (entry) =>
                    entry.impactCategory,
                  (entry) =>
                    Number(
                      entry.impactedHours ||
                        0
                    )
                ),
            };
          }
        )
        .sort(
          (first, second) =>
            second.workedHours -
            first.workedHours
        );
    }, [filteredEntries]);

  const totalWorkedHours =
    projectSummaries.reduce(
      (total, project) =>
        total +
        project.workedHours,
      0
    );

  const totalOTHours =
    projectSummaries.reduce(
      (total, project) =>
        total +
        project.otHours,
      0
    );

  const totalImpactedHours =
    projectSummaries.reduce(
      (total, project) =>
        total +
        project.impactedHours,
      0
    );

  const totalProductiveHours =
    Math.max(
      totalWorkedHours -
        totalImpactedHours,
      0
    );

  const countriesSupported =
    new Set(
      projectSummaries.map(
        (project) =>
          project.country
      )
    ).size;

  return (
    <>
      <div className="welcome-card">
        <h2>
          Project Utilization
        </h2>

        <p>
          Logged in as{" "}
          <strong>
            {employeeName}
          </strong>
        </p>
      </div>

      <div className="filter-bar">
        {(
          [
            "Today",
            "Week",
            "Month",
          ] as FilterType[]
        ).map((filter) => (
          <button
            key={filter}
            className={
              selectedFilter ===
              filter
                ? "filter-active"
                : ""
            }
            onClick={() =>
              setSelectedFilter(
                filter
              )
            }
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="stats-grid">
        <div className="card">
          <h3>
            Projects Supported
          </h3>
          <div className="value">
            {projectSummaries.length}
          </div>
        </div>

        <div className="card">
          <h3>
            Countries Supported
          </h3>
          <div className="value">
            {countriesSupported}
          </div>
        </div>

        <div className="card">
          <h3>
            Worked Hours
          </h3>
          <div className="value">
            {totalWorkedHours.toFixed(
              2
            )}
          </div>
        </div>

        <div className="card">
          <h3>OT Hours</h3>
          <div className="value ot-value">
            {totalOTHours.toFixed(
              2
            )}
          </div>
        </div>

        <div className="card">
          <h3>
            Impacted Hours
          </h3>
          <div className="value">
            {totalImpactedHours.toFixed(
              2
            )}
          </div>
        </div>

        <div className="card">
          <h3>
            Productive Hours
          </h3>
          <div className="value">
            {totalProductiveHours.toFixed(
              2
            )}
          </div>
        </div>
      </div>

      {projectSummaries.length ===
        0 && (
        <div className="compliance-card">
          <p>
            No project utilization data found for the selected period.
          </p>
        </div>
      )}

      {projectSummaries.map(
        (project) => (
          <div
            key={project.key}
            className="compliance-card"
          >
            <h2>
              {project.key}
            </h2>

            <p>
              Product:{" "}
              <strong>
                {project.productType}
              </strong>
              {" • "}
              PCS:{" "}
              <strong>
                {project.pcsVendor}
              </strong>
              {" • "}
              Entries:{" "}
              <strong>
                {project.entryCount}
              </strong>
            </p>

            <div className="stats-grid">
              <div className="card">
                <h3>
                  Worked Hours
                </h3>
                <div className="value">
                  {project.workedHours.toFixed(
                    2
                  )}
                </div>
              </div>

              <div className="card">
                <h3>
                  Regular Hours
                </h3>
                <div className="value">
                  {project.regularHours.toFixed(
                    2
                  )}
                </div>
              </div>

              <div className="card">
                <h3>OT Hours</h3>
                <div className="value ot-value">
                  {project.otHours.toFixed(
                    2
                  )}
                </div>
              </div>

              <div className="card">
                <h3>
                  Impacted Hours
                </h3>
                <div className="value">
                  {project.impactedHours.toFixed(
                    2
                  )}
                </div>
              </div>

              <div className="card">
                <h3>
                  Productive Hours
                </h3>
                <div className="value">
                  {project.productiveHours.toFixed(
                    2
                  )}
                </div>
              </div>
            </div>

            <h3>
              Commissioning Phase Breakdown
            </h3>

            {project.phaseBreakdown.map(
              (item) => (
                <div
                  key={item.name}
                  className="entry-row"
                >
                  <span>
                    {item.name}
                  </span>
                  <strong>
                    {item.hours.toFixed(
                      2
                    )}
                    h
                  </strong>
                </div>
              )
            )}

            <h3>
              Activity Breakdown
            </h3>

            {project.activityBreakdown.map(
              (item) => (
                <div
                  key={item.name}
                  className="entry-row"
                >
                  <span>
                    {item.name}
                  </span>
                  <strong>
                    {item.hours.toFixed(
                      2
                    )}
                    h
                  </strong>
                </div>
              )
            )}

            <h3>
              External Impact Breakdown
            </h3>

            {project.impactBreakdown.length ===
              0 && (
              <p>
                No external impacts recorded.
              </p>
            )}

            {project.impactBreakdown.map(
              (item) => (
                <div
                  key={item.name}
                  className="entry-row"
                >
                  <span>
                    {item.name}
                  </span>
                  <strong>
                    {item.hours.toFixed(
                      2
                    )}
                    h impacted
                  </strong>
                </div>
              )
            )}
          </div>
        )
      )}
    </>
  );
}

// END OF FILE
