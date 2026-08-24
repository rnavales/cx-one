import {
  useEffect,
  useState,
} from "react";

import useBetaUser from "../hooks/useBetaUser";

import ComplianceScore from "../components/ComplianceScore";
import ComplianceForm from "../components/ComplianceForm";
import ComplianceStatus from "../components/ComplianceStatus";

import {
  getComplianceByUser,
  saveComplianceRecord,
} from "../data/compliance";

type LMSStatus =
  | "All Caught Up"
  | "Training Due Soon"
  | "Overdue Training";

type ConcurStatus =
  | "No Expenses"
  | "Pending Card Transaction"
  | "Draft"
  | "Submitted"
  | "Approved";

type ComplianceStatusType =
  | "Submitted"
  | "Not Submitted";

type SafetyWalkStatus =
  | "Submitted"
  | "Not Submitted"
  | "Not Deployed On-Site";

export default function ComplianceDashboard() {
  const {
    employeeName,
  } = useBetaUser();

  const [
    timesheetStatus,
    setTimesheetStatus,
  ] = useState<ComplianceStatusType>(
    "Not Submitted"
  );

  const [
    lmsStatus,
    setLmsStatus,
  ] = useState<LMSStatus>(
    "All Caught Up"
  );

  const [
    concurStatus,
    setConcurStatus,
  ] = useState<ConcurStatus>(
    "Pending Card Transaction"
  );

  const [
    safetyWalkStatus,
    setSafetyWalkStatus,
  ] = useState<SafetyWalkStatus>(
    "Not Submitted"
  );

  const [
    updatedDate,
    setUpdatedDate,
  ] = useState("");

  useEffect(() => {
    if (
      !employeeName ||
      employeeName ===
        "Unknown User"
    ) {
      return;
    }

    const record =
      getComplianceByUser(
        employeeName
      );

    if (!record) {
      return;
    }

    setTimesheetStatus(
      record.timesheetStatus as ComplianceStatusType
    );

    setLmsStatus(
      record.lmsStatus as LMSStatus
    );

    setConcurStatus(
      record.concurStatus as ConcurStatus
    );

    setSafetyWalkStatus(
      record.safetyWalkStatus as SafetyWalkStatus
    );

    setUpdatedDate(
      record.updatedDate || ""
    );
  }, [employeeName]);

  useEffect(() => {
    if (
      !employeeName ||
      employeeName ===
        "Unknown User"
    ) {
      return;
    }

    const currentTimestamp =
      new Date().toISOString();

    setUpdatedDate(
      currentTimestamp
    );

    saveComplianceRecord({
      employeeName,
      timesheetStatus,
      lmsStatus,
      concurStatus,
      safetyWalkStatus,
      updatedDate:
        currentTimestamp,
    });
  }, [
    employeeName,
    timesheetStatus,
    lmsStatus,
    concurStatus,
    safetyWalkStatus,
  ]);

  const safetyWalkApplicable =
    safetyWalkStatus !==
    "Not Deployed On-Site";

  const concurApplicable =
    concurStatus !==
    "No Expenses";

  let totalChecks = 2;

  if (concurApplicable) {
    totalChecks++;
  }

  if (safetyWalkApplicable) {
    totalChecks++;
  }

  let completedChecks = 0;

  if (
    timesheetStatus ===
    "Submitted"
  ) {
    completedChecks++;
  }

  if (
    lmsStatus ===
    "All Caught Up"
  ) {
    completedChecks++;
  }

  if (
    concurApplicable &&
    (
      concurStatus ===
        "Submitted" ||
      concurStatus ===
        "Approved"
    )
  ) {
    completedChecks++;
  }

  if (
    safetyWalkApplicable &&
    safetyWalkStatus ===
      "Submitted"
  ) {
    completedChecks++;
  }

  return (
    <>
      <div className="welcome-card">
        <h2>
          Compliance Dashboard
        </h2>

        <p>
          Logged in as{" "}
          <strong>
            {employeeName}
          </strong>
        </p>

        {updatedDate && (
          <p>
            Last Updated:{" "}
            {new Date(
              updatedDate
            ).toLocaleString()}
          </p>
        )}
      </div>

      <ComplianceScore
        completedChecks={
          completedChecks
        }
        totalChecks={
          totalChecks
        }
      />

      <ComplianceForm
        timesheetStatus={
          timesheetStatus
        }
        setTimesheetStatus={
          setTimesheetStatus
        }
        lmsStatus={
          lmsStatus
        }
        setLmsStatus={
          setLmsStatus
        }
        concurStatus={
          concurStatus
        }
        setConcurStatus={
          setConcurStatus
        }
        safetyWalkStatus={
          safetyWalkStatus
        }
        setSafetyWalkStatus={
          setSafetyWalkStatus
        }
      />

      <ComplianceStatus
        timesheetStatus={
          timesheetStatus
        }
        lmsStatus={
          lmsStatus
        }
        concurStatus={
          concurStatus
        }
        safetyWalkStatus={
          safetyWalkStatus
        }
        updatedDate={
          updatedDate
        }
      />
    </>
  );
}

// END OF FILE