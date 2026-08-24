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

import {
  getComplianceRecords,
} from "../data/compliance";

import useBetaUser from "../hooks/useBetaUser";

import ComplianceSummary from "../components/ComplianceSummary";
import ManagerResetTools from "../components/ManagerResetTools";


type FilterType =
  | "Today"
  | "Week"
  | "Month";

interface EmployeeSummary {
  name: string;
  totalHours: number;
  regularHours: number;
  otHours: number;
  impactedHours: number;
  productiveHours: number;
  remoteHours: number;
  onsiteHours: number;
}

interface HoursSummary {
  name: string;
  hours: number;
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
  const start =
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

  const day =
    start.getDay();

  const daysFromMonday =
    day === 0
      ? 6
      : day - 1;

  start.setDate(
    start.getDate() -
      daysFromMonday
  );

  return start;
}

function getEndOfWeek(
  startOfWeek: Date
): Date {
  const end =
    new Date(
      startOfWeek
    );

  end.setDate(
    startOfWeek.getDate() +
      6
  );

  end.setHours(
    23,
    59,
    59,
    999
  );

  return end;
}

function summarizeHours(
  entries: TimeEntry[],
  getName: (
    entry: TimeEntry
  ) => string,
  getHours: (
    entry: TimeEntry
  ) => number
): HoursSummary[] {
  const summary =
    new Map<
      string,
      number
    >();

  entries.forEach(
    (entry) => {
      const name =
        getName(entry) ||
        "Not Specified";

      summary.set(
        name,
        (
          summary.get(name) ||
          0
        ) +
          getHours(entry)
      );
    }
  );

  return Array.from(
    summary.entries()
  )
    .map(
      ([name, hours]) => ({
        name,
        hours,
      })
    )
    .sort(
      (first, second) =>
        second.hours -
        first.hours
    );
}

export default function ManagerDashboard() {
  const {
    employeeName,
  } = useBetaUser();

  const [
    selectedFilter,
    setSelectedFilter,
  ] = useState<FilterType>(
    "Week"
  );

  const entries =
    getEntries();

  const complianceRecords =
    getComplianceRecords();

  const filteredEntries =
    useMemo(() => {
      const today =
        new Date();

      const todayStart =
        new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );

      const weekStart =
        getStartOfWeek(
          today
        );

      const weekEnd =
        getEndOfWeek(
          weekStart
        );

      return entries.filter(
        (entry) => {
          const entryDate =
            getEntryDate(
              entry
            );

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
              entryDate >=
                weekStart &&
              entryDate <=
                weekEnd
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

  const employees =
    useMemo(() => {
      const employeeMap =
        new Map<
          string,
          Omit<
            EmployeeSummary,
            "name"
          >
        >();

      filteredEntries.forEach(
        (entry) => {
          const current =
            employeeMap.get(
              entry.employeeName
            ) || {
              totalHours: 0,
              regularHours: 0,
              otHours: 0,
              impactedHours: 0,
              productiveHours: 0,
              remoteHours: 0,
              onsiteHours: 0,
            };

          const workedHours =
            Number(
              entry.hours || 0
            );

          const impactedHours =
            Number(
              entry.impactedHours ||
                0
            );

          current.totalHours +=
            workedHours;

          current.regularHours +=
            Number(
              entry.regularHours ||
                0
            );

          current.otHours +=
            Number(
              entry.otHours || 0
            );

          current.impactedHours +=
            impactedHours;

          current.productiveHours +=
            Math.max(
              workedHours -
                impactedHours,
              0
            );

          if (
            entry.workMode ===
            "Remote Support"
          ) {
            current.remoteHours +=
              workedHours;
          }

          if (
            entry.workMode ===
            "On-Site"
          ) {
            current.onsiteHours +=
              workedHours;
          }

          employeeMap.set(
            entry.employeeName,
            current
          );
        }
      );

      return Array.from(
        employeeMap.entries()
      )
        .map(
          ([name, data]) => ({
            name,
            ...data,
          })
        )
        .sort(
          (first, second) =>
            second.totalHours -
            first.totalHours
        );
    }, [filteredEntries]);

  const projectBreakdown =
    useMemo(
      () =>
        summarizeHours(
          filteredEntries,
          (entry) =>
            entry.project,
          (entry) =>
            Number(
              entry.hours || 0
            )
        ),
      [filteredEntries]
    );

  const phaseBreakdown =
    useMemo(
      () =>
        summarizeHours(
          filteredEntries,
          (entry) =>
            entry.phase,
          (entry) =>
            Number(
              entry.hours || 0
            )
        ),
      [filteredEntries]
    );

  const impactBreakdown =
    useMemo(
      () =>
        summarizeHours(
          filteredEntries.filter(
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
      [filteredEntries]
    );

  const totalTeamHours =
    employees.reduce(
      (total, employee) =>
        total +
        employee.totalHours,
      0
    );

  const totalTeamOT =
    employees.reduce(
      (total, employee) =>
        total +
        employee.otHours,
      0
    );

  const totalImpactedHours =
    employees.reduce(
      (total, employee) =>
        total +
        employee.impactedHours,
      0
    );

  const totalProductiveHours =
    employees.reduce(
      (total, employee) =>
        total +
        employee.productiveHours,
      0
    );

  const totalProjects =
    projectBreakdown.length;

  const topProject =
    projectBreakdown[0]?.name ||
    "-";

  const topPhase =
    phaseBreakdown[0]?.name ||
    "-";

  const topImpact =
    impactBreakdown[0]?.name ||
    "-";

  const totalRecords =
    complianceRecords.length;

  const timesheetSubmitted =
    complianceRecords.filter(
      (record) =>
        record.timesheetStatus ===
        "Submitted"
    ).length;

  const lmsCompliant =
    complianceRecords.filter(
      (record) =>
        record.lmsStatus ===
        "All Caught Up"
    ).length;

  const concurApplicable =
    complianceRecords.filter(
      (record) =>
        record.concurStatus !==
        "No Expenses"
    );

  const concurCompliant =
    concurApplicable.filter(
      (record) =>
        record.concurStatus ===
          "Submitted" ||
        record.concurStatus ===
          "Approved"
    ).length;

  const safetyWalkApplicable =
    complianceRecords.filter(
      (record) =>
        record.safetyWalkStatus !==
        "Not Deployed On-Site"
    );

  const safetyWalkCompliant =
    safetyWalkApplicable.filter(
      (record) =>
        record.safetyWalkStatus ===
        "Submitted"
    ).length;

  return (
    <>
      <div className="welcome-card">
        <h2>
          Manager Dashboard
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
            Active Engineers
          </h3>
          <div className="value">
            {employees.length}
          </div>
        </div>

        <div className="card">
          <h3>
            Team Worked Hours
          </h3>
          <div className="value">
            {totalTeamHours.toFixed(
              2
            )}
          </div>
        </div>

        <div className="card">
          <h3>
            Team OT Hours
          </h3>
          <div className="value ot-value">
            {totalTeamOT.toFixed(
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

        <div className="card">
          <h3>
            Projects Supported
          </h3>
          <div className="value">
            {totalProjects}
          </div>
        </div>

        <div className="card">
          <h3>Top Project</h3>
          <div className="value">
            {topProject}
          </div>
        </div>

        <div className="card">
          <h3>Top Phase</h3>
          <div className="value">
            {topPhase}
          </div>
        </div>

        <div className="card">
          <h3>Top Impact</h3>
          <div className="value">
            {topImpact}
          </div>
        </div>
      </div>

      <div className="compliance-card">
        <h2>
          Team Utilization
        </h2>

        {employees.length === 0 && (
          <p>
            No team entries found for the selected period.
          </p>
        )}

        {employees.map(
          (employee) => (
            <div
              key={employee.name}
              className="entry-row"
            >
              <div className="entry-details">
                <strong>
                  {employee.name}
                </strong>
                <br />
                <small>
                  Regular:{" "}
                  {employee.regularHours.toFixed(
                    2
                  )}
                  h
                </small>
                <br />
                <small>
                  OT:{" "}
                  {employee.otHours.toFixed(
                    2
                  )}
                  h
                </small>
                <br />
                <small>
                  Impacted:{" "}
                  {employee.impactedHours.toFixed(
                    2
                  )}
                  h
                </small>
                <br />
                <small>
                  On-Site:{" "}
                  {employee.onsiteHours.toFixed(
                    2
                  )}
                  h
                </small>
                <br />
                <small>
                  Remote:{" "}
                  {employee.remoteHours.toFixed(
                    2
                  )}
                  h
                </small>
              </div>

              <div className="entry-hours">
                {employee.totalHours.toFixed(
                  2
                )}
                h
              </div>
            </div>
          )
        )}
      </div>

      <div className="compliance-card">
        <h2>
          Project Support
        </h2>

        {projectBreakdown.length ===
          0 && (
          <p>
            No project support data found.
          </p>
        )}

        {projectBreakdown.map(
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
      </div>

      <div className="compliance-card">
        <h2>
          Commissioning Phase Breakdown
        </h2>

        {phaseBreakdown.length ===
          0 && (
          <p>
            No commissioning phase data found.
          </p>
        )}

        {phaseBreakdown.map(
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
      </div>

      <div className="compliance-card">
        <h2>
          External Impact Breakdown
        </h2>

        {impactBreakdown.length ===
          0 && (
          <p>
            No external impacts recorded for the selected period.
          </p>
        )}

        {impactBreakdown.map(
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

      <ComplianceSummary
        totalRecords={
          totalRecords
        }
        timesheetSubmitted={
          timesheetSubmitted
        }
        lmsCompliant={
          lmsCompliant
        }
        concurCompliant={
          concurCompliant
        }
        safetyWalkCompliant={
          safetyWalkCompliant
        }
        safetyWalkApplicable={
          safetyWalkApplicable.length
        }
      />

      <div className="compliance-card">
        <h2>
          Team Compliance
        </h2>

        {complianceRecords.length ===
          0 && (
          <p>
            No compliance records found.
          </p>
        )}

        {complianceRecords.map(
          (record) => (
            <div
              key={
                record.employeeName
              }
              className="entry-row"
            >
              <div>
                <strong>
                  {record.employeeName}
                </strong>
              </div>

              <div>
                SAP{" "}
                {record.timesheetStatus ===
                "Submitted"
                  ? "✅"
                  : "❌"}
              </div>

              <div>
                LMS{" "}
                {record.lmsStatus ===
                "All Caught Up"
                  ? "✅"
                  : record.lmsStatus ===
                      "Training Due Soon"
                    ? "⚠️"
                    : "❌"}
              </div>

              <div>
                Concur{" "}
                {record.concurStatus ===
                "No Expenses"
                  ? "➖"
                  : record.concurStatus ===
                        "Approved" ||
                      record.concurStatus ===
                        "Submitted"
                    ? "✅"
                    : record.concurStatus ===
                        "Pending Card Transaction"
                      ? "⏳"
                      : "⚠️"}
              </div>

              <div>
                Safety{" "}
                {record.safetyWalkStatus ===
                "Submitted"
                  ? "✅"
                  : record.safetyWalkStatus ===
                      "Not Deployed On-Site"
                    ? "➖"
                    : "❌"}
              </div>
            </div>
          )
        )}
      </div>

      <div className="compliance-card">
        <h2>OT Ranking</h2>

        {[...employees]
          .sort(
            (first, second) =>
              second.otHours -
              first.otHours
          )
          .map(
            (employee) => (
              <div
                key={employee.name}
                className="entry-row"
              >
                <span>
                  {employee.name}
                </span>
                <strong>
                  {employee.otHours.toFixed(
                    2
                  )}
                  h
                </strong>
              </div>
            )
          )}
      </div>

      <ManagerResetTools />
    </>
  );
}

// END OF FILE
