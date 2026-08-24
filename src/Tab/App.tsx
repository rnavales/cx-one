import { useState } from "react";

import "./App.css";

import Dashboard from "./pages/Dashboard";
import TimeEntry from "./pages/TimeEntry";
import ManagerDashboard from "./pages/ManagerDashboard";
import ProjectUtilization from "./pages/ProjectUtilization";
import ProjectUtilizationByEmployee from "./pages/ProjectUtilizationByEmployee";
import EmployeeUtilization from "./pages/EmployeeUtilization";
import ComplianceDashboard from "./pages/ComplianceDashboard";
import OTContributionReport from "./pages/OTContributionReport";

import useTeamsUser from "./hooks/useTeamsUser";
import { isManager } from "./services/RoleService";

type PageType =
  | "dashboard"
  | "timeentry"
  | "manager"
  | "projects"
  | "projectsByEmployee"
  | "employees"
  | "compliance"
  | "otreport";

export default function App() {
  const [page, setPage] =
    useState<PageType>(
      "dashboard"
    );

  const {
    employeeLogin,
  } = useTeamsUser();

  const managerAccess =
    isManager(
      employeeLogin
    );

  return (
    <div className="robin-container">
      <div className="header">
        <h1>CX One</h1>

        <p>
          From Site to Dashboard
        </p>
      </div>

      <div className="navbar">
        <button
          onClick={() =>
            setPage(
              "dashboard"
            )
          }
        >
          Dashboard
        </button>

        <button
          onClick={() =>
            setPage(
              "timeentry"
            )
          }
        >
          Time Entry
        </button>

        <button
          onClick={() =>
            setPage(
              "projects"
            )
          }
        >
          Project Utilization
        </button>

        <button
          onClick={() =>
            setPage(
              "compliance"
            )
          }
        >
          Compliance
        </button>

        {managerAccess && (
          <button
            onClick={() =>
              setPage(
                "projectsByEmployee"
              )
            }
          >
            Project by Employee
          </button>
        )}

        {managerAccess && (
          <button
            onClick={() =>
              setPage(
                "employees"
              )
            }
          >
            Employee Utilization
          </button>
        )}

        {managerAccess && (
          <button
            onClick={() =>
              setPage(
                "manager"
              )
            }
          >
            Manager Dashboard
          </button>
        )}

        {managerAccess && (
          <button
            onClick={() =>
              setPage(
                "otreport"
              )
            }
          >
            OT Report
          </button>
        )}
      </div>

      {page ===
        "dashboard" && (
        <Dashboard />
      )}

      {page ===
        "timeentry" && (
        <TimeEntry />
      )}

      {page ===
        "projects" && (
        <ProjectUtilization />
      )}

      {page ===
        "compliance" && (
        <ComplianceDashboard />
      )}

      {page ===
        "projectsByEmployee" &&
        managerAccess && (
          <ProjectUtilizationByEmployee />
        )}

      {page ===
        "employees" &&
        managerAccess && (
          <EmployeeUtilization />
        )}

      {page ===
        "manager" &&
        managerAccess && (
          <ManagerDashboard />
        )}

      {page ===
        "otreport" &&
        managerAccess && (
          <OTContributionReport />
        )}
    </div>
  );
}

// END OF FILE