import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  deleteEntry,
  getEntries,
} from "../data";

import type {
  TimeEntry,
} from "../data";

import DashboardFilters from "../components/DashboardFilters";
import DashboardStats from "../components/DashboardStats";
import RecentEntries from "../components/RecentEntries";
import WeeklySummary from "../components/WeeklySummary";

import useTeamsUser from "../hooks/useTeamsUser";

type FilterType =
  | "Today"
  | "Week"
  | "Month";

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

export default function Dashboard() {
  const {
    employeeName,
  } = useTeamsUser();

  const [
    entries,
    setEntries,
  ] = useState<
    TimeEntry[]
  >([]);

  const [
    selectedFilter,
    setSelectedFilter,
  ] = useState<
    FilterType
  >("Today");

  const loadEntries = () => {
    setEntries(
      getEntries()
    );
  };

  useEffect(() => {
    loadEntries();

    const timer =
      window.setInterval(
        loadEntries,
        1000
      );

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, []);

  const userEntries =
    useMemo(
      () =>
        entries.filter(
          (entry) =>
            entry.employeeName ===
              employeeName
        ),
      [
        entries,
        employeeName,
      ]
    );

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

      return userEntries.filter(
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
      userEntries,
      selectedFilter,
    ]);

  const weeklyEntries =
    useMemo(() => {
      const today =
        new Date();

      const weekStart =
        getStartOfWeek(
          today
        );

      const weekEnd =
        getEndOfWeek(
          weekStart
        );

      return userEntries.filter(
        (entry) => {
          const entryDate =
            getEntryDate(
              entry
            );

          return (
            entryDate >=
              weekStart &&
            entryDate <=
              weekEnd
          );
        }
      );
    }, [userEntries]);

  const totalHours =
    filteredEntries.reduce(
      (
        total,
        entry
      ) =>
        total +
        Number(
          entry.hours || 0
        ),
      0
    );

  const totalOTHours =
    filteredEntries.reduce(
      (
        total,
        entry
      ) =>
        total +
        Number(
          entry.otHours || 0
        ),
      0
    );

  const totalImpactedHours =
    filteredEntries.reduce(
      (
        total,
        entry
      ) =>
        total +
        Number(
          entry.impactedHours || 0
        ),
      0
    );

  const totalProductiveHours =
    Math.max(
      totalHours -
        totalImpactedHours,
      0
    );

  const totalProjects =
    new Set(
      filteredEntries
        .filter(
          (entry) =>
            entry.category ===
              "Project Work"
        )
        .map(
          (entry) =>
            entry.project
        )
    ).size;

  const remoteSupportCount =
    filteredEntries.filter(
      (entry) =>
        entry.workMode ===
          "Remote Support"
    ).length;

  const onsiteCount =
    filteredEntries.filter(
      (entry) =>
        entry.workMode ===
          "On-Site"
    ).length;

  const topProject =
    useMemo(() => {
      const projectHours =
        new Map<
          string,
          number
        >();

      filteredEntries.forEach(
        (entry) => {
          if (!entry.project) {
            return;
          }

          projectHours.set(
            entry.project,
            (
              projectHours.get(
                entry.project
              ) || 0
            ) +
              Number(
                entry.hours || 0
              )
          );
        }
      );

      return (
        Array.from(
          projectHours.entries()
        ).sort(
          (first, second) =>
            second[1] -
            first[1]
        )[0]?.[0] || "-"
      );
    }, [filteredEntries]);

  const topActivity =
    useMemo(() => {
      const activityCount =
        new Map<
          string,
          number
        >();

      filteredEntries.forEach(
        (entry) => {
          if (!entry.activity) {
            return;
          }

          activityCount.set(
            entry.activity,
            (
              activityCount.get(
                entry.activity
              ) || 0
            ) + 1
          );
        }
      );

      return (
        Array.from(
          activityCount.entries()
        ).sort(
          (first, second) =>
            second[1] -
            first[1]
        )[0]?.[0] || "-"
      );
    }, [filteredEntries]);

  const weeklyWorkedHours =
    weeklyEntries.reduce(
      (
        total,
        entry
      ) =>
        total +
        Number(
          entry.hours || 0
        ),
      0
    );

  const weeklyRegularHours =
    weeklyEntries.reduce(
      (
        total,
        entry
      ) =>
        total +
        Number(
          entry.regularHours || 0
        ),
      0
    );

  const weeklyOTHours =
    weeklyEntries.reduce(
      (
        total,
        entry
      ) =>
        total +
        Number(
          entry.otHours || 0
        ),
      0
    );

    const weeklyImpactedHours =
  weeklyEntries.reduce(
    (
      total,
      entry
    ) =>
      total +
      Number(
        entry.impactedHours ||
          0
      ),
    0
  );

  const weeklyProjects =
    new Set(
      weeklyEntries
        .filter(
          (entry) =>
            entry.category ===
              "Project Work"
        )
        .map(
          (entry) =>
            entry.project
        )
    ).size;

  const handleDelete = (
    selectedEntry: TimeEntry
  ) => {
    const allEntries =
      getEntries();

    const index =
      allEntries.findIndex(
        (entry) =>
          entry.createdDate ===
            selectedEntry.createdDate &&
          entry.project ===
            selectedEntry.project &&
          entry.employeeName ===
            selectedEntry.employeeName
      );

    if (index >= 0) {
      deleteEntry(index);
      loadEntries();
    }
  };

  return (
    <>
      <div className="welcome-card">
        <h2>
          Welcome{" "}
          {employeeName}
        </h2>

        <p>
          Ready for today's commissioning activities
        </p>
      </div>

      <WeeklySummary
  workedHours={
    weeklyWorkedHours
  }
  regularHours={
    weeklyRegularHours
  }
  otHours={
    weeklyOTHours
  }
  projectsWorked={
    weeklyProjects
  }
  impactedHours={
    weeklyImpactedHours
  }
/>

      <DashboardFilters
        selectedFilter={
          selectedFilter
        }
        onFilterChange={
          setSelectedFilter
        }
      />

      <DashboardStats
        totalHours={Number(
          totalHours.toFixed(2)
        )}
        totalOTHours={Number(
          totalOTHours.toFixed(2)
        )}
        totalProjects={
          totalProjects
        }
        totalEntries={
          filteredEntries.length
        }
        remoteSupportCount={
          remoteSupportCount
        }
        onsiteCount={
          onsiteCount
        }
      />

      <div className="stats-grid">
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
            Top Project
          </h3>

          <div className="value">
            {topProject}
          </div>
        </div>

        <div className="card">
          <h3>
            Top Activity
          </h3>

          <div className="value">
            {topActivity}
          </div>
        </div>
      </div>

      <RecentEntries
        entries={
          filteredEntries
        }
        onDelete={
          handleDelete
        }
      />
    </>
  );
}

// END OF FILE
