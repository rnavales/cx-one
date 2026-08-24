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

function getEntryDate(entry: any): Date {
  const value = entry.workDate || entry.createdDate;
  return new Date(`${value.substring ? value.substring(0,10): value}T12:00:00`);
}

export default function EmployeeUtilization() {
  const { employeeName } = useTeamsUser();

  const [selectedFilter, setSelectedFilter] = useState<FilterType>("Week");

  const entries = getEntries();

  const filteredEntries = useMemo(() => {
    const today = new Date();

    return entries.filter((entry) => {
      const entryDate = getEntryDate(entry);

      if (selectedFilter === "Today") {
        return entryDate.toDateString() === today.toDateString();
      }

      if (selectedFilter === "Week") {
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        return entryDate >= weekAgo;
      }

      return (
        entryDate.getMonth() === today.getMonth() &&
        entryDate.getFullYear() === today.getFullYear()
      );
    });
  }, [entries, selectedFilter]);

  const employeeMap = new Map();

  filteredEntries.forEach((entry) => {
    const current = employeeMap.get(entry.employeeName) || {
      workedHours: 0,
      regularHours: 0,
      otHours: 0,
      impactedHours: 0,
      productiveHours: 0,
      remoteHours: 0,
      onsiteHours: 0,
      projects: new Set<string>(),
      activities: new Map<string, number>(),
    };

    const worked = Number(entry.hours || 0);
    const impacted = Number(entry.impactedHours || 0);

    current.workedHours += worked;
    current.regularHours += Number(entry.regularHours || 0);
    current.otHours += Number(entry.otHours || 0);
    current.impactedHours += impacted;
    current.productiveHours += Math.max(worked - impacted, 0);

    if (entry.workMode === "Remote Support") current.remoteHours += worked;
    if (entry.workMode === "On-Site") current.onsiteHours += worked;

    current.projects.add(entry.project);
    current.activities.set(entry.activity, (current.activities.get(entry.activity) || 0) + 1);

    employeeMap.set(entry.employeeName, current);
  });

  const employees = Array.from(employeeMap.entries()).map(([name, data]: any) => {
    const topActivity = Array.from(data.activities.entries())
      .sort((a:any,b:any)=>b[1]-a[1])[0]?.[0] || '-';

    return {
      name,
      ...data,
      projectCount: data.projects.size,
      topActivity,
    };
  }).sort((a:any,b:any)=>b.workedHours-a.workedHours);

  return (
    <>
      <div className="welcome-card">
        <h2>Employee Utilization</h2>
        <p>Logged in as <strong>{employeeName}</strong></p>
      </div>

      <div className="filter-bar">
        <button className={selectedFilter === "Today" ? "filter-active" : ""} onClick={() => setSelectedFilter("Today")}>Today</button>
        <button className={selectedFilter === "Week" ? "filter-active" : ""} onClick={() => setSelectedFilter("Week")}>Week</button>
        <button className={selectedFilter === "Month" ? "filter-active" : ""} onClick={() => setSelectedFilter("Month")}>Month</button>
      </div>

      <div className="compliance-card">
        <h2>Engineer Utilization</h2>

        {employees.length === 0 && <p>No utilization data available.</p>}

        {employees.map((employee:any) => (
          <div key={employee.name} className="entry-row">
            <div className="entry-details">
              <strong>{employee.name}</strong><br />
              <small>Worked: {employee.workedHours.toFixed(2)}h</small><br />
              <small>Regular: {employee.regularHours.toFixed(2)}h</small><br />
              <small>OT: {employee.otHours.toFixed(2)}h</small><br />
              <small>Impacted: {employee.impactedHours.toFixed(2)}h</small><br />
              <small>Productive: {employee.productiveHours.toFixed(2)}h</small><br />
              <small>Projects: {employee.projectCount}</small><br />
              <small>Top Activity: {employee.topActivity}</small><br />
              <small>Remote: {employee.remoteHours.toFixed(2)}h</small><br />
              <small>On-Site: {employee.onsiteHours.toFixed(2)}h</small>
            </div>

            <div className="entry-hours">
              {employee.workedHours.toFixed(2)}h
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// END OF FILE
