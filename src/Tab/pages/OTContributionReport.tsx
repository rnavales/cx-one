import {
  useMemo,
  useState,
} from "react";

import {
  getEntries,
} from "../data";

import useBetaUser from "../hooks/useBetaUser";

type FilterType =
  | "Today"
  | "Week"
  | "Month";

export default function OTContributionReport() {
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

      return entries.filter(
        (entry) => {
          const entryDate =
            new Date(
              entry.workDate ||
                entry.createdDate
            );

          if (
            selectedFilter ===
            "Today"
          ) {
            return (
              entryDate.toDateString() ===
              today.toDateString()
            );
          }

          if (
            selectedFilter ===
            "Week"
          ) {
            const weekAgo =
              new Date();

            weekAgo.setDate(
              today.getDate() - 7
            );

            return (
              entryDate >=
              weekAgo
            );
          }

          if (
            selectedFilter ===
            "Month"
          ) {
            return (
              entryDate.getMonth() ===
                today.getMonth() &&
              entryDate.getFullYear() ===
                today.getFullYear()
            );
          }

          return true;
        }
      );
    }, [
      entries,
      selectedFilter,
    ]);

  const employeeMap =
    new Map<
      string,
      {
        workedHours: number;
        regularHours: number;
        otHours: number;
      }
    >();

  const projectMap =
    new Map<
      string,
      {
        regularHours: number;
        otHours: number;
      }
    >();

  filteredEntries.forEach(
    (entry) => {
      const employee =
        employeeMap.get(
          entry.employeeName
        ) || {
          workedHours: 0,
          regularHours: 0,
          otHours: 0,
        };

      employee.workedHours +=
        Number(
          entry.hours || 0
        );

      employee.regularHours +=
        Number(
          entry.regularHours || 0
        );

      employee.otHours +=
        Number(
          entry.otHours || 0
        );

      employeeMap.set(
        entry.employeeName,
        employee
      );

      if (
        entry.category ===
        "Project Work"
      ) {
        const project =
          projectMap.get(
            entry.project
          ) || {
            regularHours: 0,
            otHours: 0,
          };

        project.regularHours +=
          Number(
            entry.regularHours || 0
          );

        project.otHours +=
          Number(
            entry.otHours || 0
          );

        projectMap.set(
          entry.project,
          project
        );
      }
    }
  );

  const employees =
    Array.from(
      employeeMap.entries()
    ).map(
      ([name, data]) => ({
        name,
        ...data,
      })
    );

  const projects =
    Array.from(
      projectMap.entries()
    ).map(
      ([project, data]) => ({
        project,
        ...data,
      })
    );

  return (
    <>
      <div className="welcome-card">
        <h2>
          OT Contribution Report
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
          OT by Employee
        </h2>

        {employees
          .sort(
            (a, b) =>
              b.otHours -
              a.otHours
          )
          .map(
            (
              employee,
              index
            ) => (
              <div
                key={index}
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
                </div>

                <div className="entry-hours">
                  {employee.otHours.toFixed(
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
          OT by Project
        </h2>

        {projects
          .sort(
            (a, b) =>
              b.otHours -
              a.otHours
          )
          .map(
            (
              project,
              index
            ) => (
              <div
                key={index}
                className="entry-row"
              >
                <div className="entry-details">
                  <strong>
                    {
                      project.project
                    }
                  </strong>

                  <br />

                  <small>
                    Regular:{" "}
                    {project.regularHours.toFixed(
                      2
                    )}
                    h
                  </small>

                  <br />

                  <small>
                    OT:{" "}
                    {project.otHours.toFixed(
                      2
                    )}
                    h
                  </small>
                </div>

                <div className="entry-hours">
                  {project.otHours.toFixed(
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