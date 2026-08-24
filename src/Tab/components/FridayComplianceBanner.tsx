import {
  getComplianceByUser,
} from "../data/compliance";

import useTeamsUser from "../hooks/useTeamsUser";

export default function FridayComplianceBanner() {
  const {
    employeeName,
  } = useTeamsUser();

  if (
    !employeeName ||
    employeeName ===
      "Unknown User"
  ) {
    return null;
  }

  const compliance =
    getComplianceByUser(
      employeeName
    );

  if (!compliance) {
    return (
      <div className="ot-notice">
        <strong>
          Weekly Compliance Check
        </strong>

        <br />

        No compliance record found for this week.
      </div>
    );
  }

  const today =
    new Date();

  const dayOfWeek =
    today.getDay();

  const showBanner =
    dayOfWeek === 4 ||
    dayOfWeek === 5;

  if (!showBanner) {
    return null;
  }

  const safetyWalkApplicable =
    compliance.safetyWalkStatus !==
    "Not Deployed On-Site";

  const totalChecks =
    safetyWalkApplicable
      ? 4
      : 3;

  let completedChecks = 0;

  if (
    compliance.timesheetStatus ===
    "Submitted"
  ) {
    completedChecks++;
  }

  if (
    compliance.lmsStatus ===
    "All Caught Up"
  ) {
    completedChecks++;
  }

  if (
    compliance.concurStatus ===
      "Submitted" ||
    compliance.concurStatus ===
      "Approved"
  ) {
    completedChecks++;
  }

  if (
    safetyWalkApplicable &&
    compliance.safetyWalkStatus ===
      "Submitted"
  ) {
    completedChecks++;
  }

  return (
    <div className="ot-notice">
      <strong>
        Friday Compliance Check
      </strong>

      <br />

      Compliance Score:{" "}
      {completedChecks}/{totalChecks}

      <br />
      <br />

      SAP Timesheet{" "}
      {compliance.timesheetStatus ===
      "Submitted"
        ? "✅"
        : "❌"}

      <br />

      LMS{" "}
      {compliance.lmsStatus ===
      "All Caught Up"
        ? "✅"
        : "⚠️"}

      <br />

      Concur{" "}
      {compliance.concurStatus ===
          "Submitted" ||
      compliance.concurStatus ===
        "Approved"
        ? "✅"
        : compliance.concurStatus ===
            "Pending Card Transaction"
          ? "⏳"
          : "⚠️"}

      <br />

      Safety Walk{" "}
      {compliance.safetyWalkStatus ===
      "Submitted"
        ? "✅"
        : compliance.safetyWalkStatus ===
            "Not Deployed On-Site"
          ? "➖"
          : "❌"}
    </div>
  );
}

// END OF FILE
