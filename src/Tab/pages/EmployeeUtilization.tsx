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

import useBetaUser from "../hooks/useBetaUser";

type FilterType =
  | "Today"
  | "Week"
  | "Month";

interface EmployeeData {
  workedHours: number;
  regularHours: number;
  otHours: number;
  impactedHours: number;
  productiveHours: number;
  remoteHours: number;
  onsiteHours: number;
  projects: Set<string>;
  activities: Map<string, number>;
}

interface EmployeeSummary {
  name: string;
  workedHours: number;
  regularHours: number;
  otHours: number;
  impactedHours: number;
  productiveHours: number;
  remoteHours: number;
  onsiteHours: number;
  projectCount: number;
  topActivity: string;
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

function getTopActivity(
  activities: Map<
    string,
    number
  >
): string {
  const sortedActivities:
    Array<
      [string, number]
    > =
      Array.from(
        activities.entries()
      ).sort(
        (
          first,
          second
        ) =>
          second[1] -
          first[1]
      );

  const firstActivity =
    sortedActivities[0];

  return firstActivity
    ? firstActivity[0]
    : "-";
}

export default function EmployeeUtilization() {
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
    useMemo<
      EmployeeSummary[]
    >(() => {
      const employeeMap =
        new Map<
          string,
          EmployeeData
        >();

      filteredEntries.forEach(
        (entry) => {
          const current =
            employeeMap.get(
              entry.employeeName
            ) || {
              workedHours: 0,
              regularHours: 0,
              otHours: 0,
              impactedHours: 0,
              productiveHours: 0,
              remoteHours: 0,
              onsiteHours: 0,
              projects:
                new Set<string>(),
              activities:
                new Map<
                  string,
                  number
                >(),
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

          current.workedHours +=
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

          if (entry.project) {
            current.projects.add(
              entry.project
            );
          }

          if (entry.activity) {
            current.activities.set(
              entry.activity,
              (
                current.activities.get(
                  entry.activity
                ) || 0
              ) + 1
            );
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
          (
            [
              name,
              data,
            ]
          ): EmployeeSummary => ({
            name,
            workedHours:
              data.workedHours,
            regularHours:
              data.regularHours,
            otHours:
              data.otHours,
            impactedHours:
              data.impactedHours,
            productiveHours:
              data.productiveHours,
            remoteHours:
              data.remoteHours,
            onsiteHours:
              data.onsiteHours,
            projectCount:
              data.projects.size,
            topActivity:
              getTopActivity(
                data.activities
              ),
          })
        )
        .sort(
          (
            first,
            second
          ) =>
            second.workedHours -
            first.workedHours
        );
    }, [filteredEntries]);

  return (
    <>
      <div className="welcome-card">
        <h2>
          Employee Utilization
        </h2>

        <p>
          Logged in as{" "}
          <strong>
            {employeeName}
          </strong>
        </p>
      </div>

      <div className="filter-bar">
        <button
          className={
            selectedFilter ===
            "Today"
              ? "filter-active"
              : ""
          }
          onClick={() =>
            setSelectedFilter(
              "Today"
            )
          }
        >
          Today
        </button>

        <button
          className={
            selectedFilter ===
            "Week"
              ? "filter-active"
              : ""
          }
          onClick={() =>
            setSelectedFilter(
              "Week"
            )
          }
        >
          Week
        </button>

        <button
          className={
            selectedFilter ===
            "Month"
              ? "filter-active"
              : ""
          }
          onClick={() =>
            setSelectedFilter(
              "Month"
            )
          }
        >
          Month
        </button>
      </div>

      <div className="compliance-card">
        <h2>
          Engineer Utilization
        </h2>

        {employees.length ===
          0 && (
          <p>
            No utilization data available.
          </p>
        )}

        {employees.map(
          (employee) => (
            <div
              key={
                employee.name
              }
              className="entry-row"
            >
              <div className="entry-details">
                <strong>
                  {employee.name}
                </strong>

                <br />

                <small>
                  Worked:{" "}
                  {employee.workedHours.toFixed(
                    2
                  )}
                  h
                </small>

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
                  Productive:{" "}
                  {employee.productiveHours.toFixed(
                    2
                  )}
                  h
                </small>

                <br />

                <small>
                  Projects:{" "}
                  {
                    employee.projectCount
                  }
                </small>

                <br />

                <small>
                  Top Activity:{" "}
                  {
                    employee.topActivity
                  }
                </small>

                <br />

                <small>
                  Remote:{" "}
                  {employee.remoteHours.toFixed(
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
              </div>

              <div className="entry-hours">
                {employee.workedHours.toFixed(
                  2
                )}
                h
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
}

// END OF FILE