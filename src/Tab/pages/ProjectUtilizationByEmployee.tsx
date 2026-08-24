import {
  useMemo,
  useState,
} from "react";

import {
  getEntries,
} from "../data";

import useTeamsUser from "../hooks/useTeamsUser";

type FilterType =
  | "Today"
  | "Week"
  | "Month";

export default function ProjectUtilizationByEmployee() {
  const {
    employeeName,
  } = useTeamsUser();

  const [
    selectedFilter,
    setSelectedFilter,
  ] = useState<FilterType>(
    "Today"
  );

  const entries =
    getEntries();

  const filteredEntries =
    useMemo(() => {
      const today =
        new Date();

      return entries.filter(
        (entry) => {
          if (
            entry.category !==
            "Project Work"
          ) {
            return false;
          }

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

  const countryMap =
    new Map<
      string,
      Map<
        string,
        Map<string, number>
      >
    >();

  filteredEntries.forEach(
    (entry) => {
      const country =
        entry.country ||
        "Unknown";

      const project =
        entry.project;

      const employee =
        entry.employeeName;

      if (
        !countryMap.has(
          country
        )
      ) {
        countryMap.set(
          country,
          new Map()
        );
      }

      const projectMap =
        countryMap.get(
          country
        )!;

      if (
        !projectMap.has(
          project
        )
      ) {
        projectMap.set(
          project,
          new Map()
        );
      }

      const employeeMap =
        projectMap.get(
          project
        )!;

      const currentHours =
        employeeMap.get(
          employee
        ) || 0;

      employeeMap.set(
        employee,
        currentHours +
          Number(
            entry.hours || 0
          )
      );
    }
  );

  return (
    <>
      <div className="welcome-card">
        <h2>
          Project Utilization by Employee
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

      {countryMap.size ===
        0 && (
        <div className="compliance-card">
          <p>
            No project utilization data available.
          </p>
        </div>
      )}

      {Array.from(
        countryMap.entries()
      ).map(
        (
          [
            country,
            projectMap,
          ],
          countryIndex
        ) => (
          <div
            key={
              countryIndex
            }
            className="compliance-card"
          >
            <h2>
              {country}
            </h2>

            {Array.from(
              projectMap.entries()
            ).map(
              (
                [
                  project,
                  employeeMap,
                ],
                projectIndex
              ) => (
                <div
                  key={
                    projectIndex
                  }
                  style={{
                    marginBottom:
                      "20px",
                  }}
                >
                  <h3>
                    {project}
                  </h3>

                  {Array.from(
                    employeeMap.entries()
                  )
                    .sort(
                      (
                        a,
                        b
                      ) =>
                        b[1] -
                        a[1]
                    )
                    .map(
                      (
                        [
                          employee,
                          hours,
                        ],
                        employeeIndex
                      ) => (
                        <div
                          key={
                            employeeIndex
                          }
                          className="entry-row"
                        >
                          <div>
                            {
                              employee
                            }
                          </div>

                          <div className="entry-hours">
                            {hours.toFixed(
                              2
                            )}
                            h
                          </div>
                        </div>
                      )
                    )}
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