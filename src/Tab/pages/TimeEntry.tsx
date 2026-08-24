import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getEntries,
  saveEntry,
} from "../data";

import useBetaUser from "../hooks/useBetaUser";
import { getLastEntry } from "../services/LastEntryService";

import {
  getProjectConfig,
  projectOptions,
} from "../data/projectConfig";

import {
  activityConfig,
  getProcessForActivity,
} from "../data/activityConfig";

const phases = [
  "Cold Commissioning (Array)",
  "Cold Commissioning (Core)",
  "Hot Commissioning",
  "SAT",
];

const workModes = [
  "On-Site",
  "Remote Support",
  "Office",
  "Work From Home",
  "Travel",
  "Leave",
];

const impactCategories = [
  "None",
  "External - Weather",
  "External - Construction",
  "External - Logistics",
  "External - Customer",
  "External - Grid",
  "External - Vendor",
  "External - Utilities",
  "External - Permitting",
  "External - Other",
];

function roundHours(value: number): number {
  return Number(value.toFixed(2));
}

function getTodayValue(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function calculateRegularAndOT(
  employeeName: string,
  workDate: string,
  currentHours: number
) {
  if (
    !employeeName ||
    !workDate ||
    currentHours <= 0
  ) {
    return {
      existingHours: 0,
      regularHours: 0,
      otHours: 0,
      isWeekend: false,
    };
  }

  const selectedDate = new Date(
    `${workDate}T12:00:00`
  );

  const dayOfWeek = selectedDate.getDay();
  const isWeekend =
    dayOfWeek === 0 || dayOfWeek === 6;

  const existingHours = getEntries()
    .filter(
      (entry) =>
        entry.employeeName === employeeName &&
        entry.workDate === workDate
    )
    .reduce(
      (total, entry) =>
        total + Number(entry.hours || 0),
      0
    );

  if (isWeekend) {
    return {
      existingHours: roundHours(existingHours),
      regularHours: 0,
      otHours: roundHours(currentHours),
      isWeekend: true,
    };
  }

  const remainingRegularHours = Math.max(
    8 - existingHours,
    0
  );

  const regularHours = Math.min(
    currentHours,
    remainingRegularHours
  );

  return {
    existingHours: roundHours(existingHours),
    regularHours: roundHours(regularHours),
    otHours: roundHours(
      Math.max(currentHours - regularHours, 0)
    ),
    isWeekend: false,
  };
}

export default function TimeEntry() {
  const {
    employeeName,
    employeeLogin,
    isLoadingUser,
    userError,
  } = useBetaUser();

  const [projectKey, setProjectKey] =
    useState("");

  const [phase, setPhase] =
    useState("");

  const [activity, setActivity] =
    useState("");

  const [activityDetails, setActivityDetails] =
    useState("");

  const [workMode, setWorkMode] =
    useState("");

  const [workDate, setWorkDate] =
    useState(getTodayValue());

  const [hoursWorked, setHoursWorked] =
    useState("");

  const [impactCategory, setImpactCategory] =
    useState("None");

  const [impactedHours, setImpactedHours] =
    useState("0");

  const [impactComments, setImpactComments] =
    useState("");

  const [lastEntryLoaded, setLastEntryLoaded] =
    useState(false);

  const selectedProject = useMemo(
    () => getProjectConfig(projectKey),
    [projectKey]
  );

  const numericHoursWorked = useMemo(
    () => roundHours(Number(hoursWorked || 0)),
    [hoursWorked]
  );

  const numericImpactedHours = useMemo(
    () => roundHours(Number(impactedHours || 0)),
    [impactedHours]
  );

  const process = useMemo(
    () => getProcessForActivity(activity),
    [activity]
  );

  const overtimeResult = useMemo(
    () =>
      calculateRegularAndOT(
        employeeName,
        workDate,
        numericHoursWorked
      ),
    [
      employeeName,
      workDate,
      numericHoursWorked,
    ]
  );

  const productiveHours = useMemo(
    () =>
      roundHours(
        Math.max(
          numericHoursWorked -
            numericImpactedHours,
          0
        )
      ),
    [numericHoursWorked, numericImpactedHours]
  );

  useEffect(() => {
    if (
      isLoadingUser ||
      userError ||
      !employeeName ||
      employeeName === "Unknown User" ||
      lastEntryLoaded
    ) {
      return;
    }

    const lastEntry = getLastEntry(
      employeeName
    );

    if (lastEntry) {
      const matchingProjectKey =
        projectOptions.find((option) => {
          const config = getProjectConfig(option);

          return (
            config?.country ===
              lastEntry.country &&
            config?.project ===
              lastEntry.project
          );
        }) || "";

      setProjectKey(matchingProjectKey);
      setPhase(lastEntry.phase || "");
      setActivity(lastEntry.activity || "");
      setActivityDetails(
        lastEntry.activityDetails || ""
      );
      setWorkMode(lastEntry.workMode || "");
      setHoursWorked(
        lastEntry.hours
          ? String(lastEntry.hours)
          : ""
      );
    }

    setLastEntryLoaded(true);
  }, [
    employeeName,
    isLoadingUser,
    userError,
    lastEntryLoaded,
  ]);

  function clearImpact() {
    setImpactCategory("None");
    setImpactedHours("0");
    setImpactComments("");
  }

  function clearForm() {
    setProjectKey("");
    setPhase("");
    setActivity("");
    setActivityDetails("");
    setWorkMode("");
    setWorkDate(getTodayValue());
    setHoursWorked("");
    clearImpact();
  }

  function validateEntry(): boolean {
    if (isLoadingUser) {
      alert("The Teams user is still loading.");
      return false;
    }

    if (
      userError ||
      !employeeName ||
      employeeName === "Unknown User"
    ) {
      alert(
        "The logged-in Teams user could not be identified."
      );
      return false;
    }

    if (!workDate) {
      alert("Please select a work date.");
      return false;
    }

    if (!selectedProject) {
      alert("Please select a project.");
      return false;
    }

    if (!phase) {
      alert("Please select a commissioning phase.");
      return false;
    }

    if (!activity) {
      alert("Please select an activity.");
      return false;
    }

    if (!workMode) {
      alert("Please select a work mode.");
      return false;
    }

    if (
      !Number.isFinite(numericHoursWorked) ||
      numericHoursWorked <= 0 ||
      numericHoursWorked > 24
    ) {
      alert(
        "Hours worked must be greater than zero and no more than 24."
      );
      return false;
    }

    if (
      !Number.isFinite(numericImpactedHours) ||
      numericImpactedHours < 0
    ) {
      alert(
        "Hours impacted must be zero or a positive number."
      );
      return false;
    }

    if (
      numericImpactedHours >
      numericHoursWorked
    ) {
      alert(
        "Hours impacted cannot exceed hours worked."
      );
      return false;
    }

    if (
      impactCategory !== "None" &&
      numericImpactedHours <= 0
    ) {
      alert(
        "Enter hours impacted when an external impact is selected."
      );
      return false;
    }

    if (
      impactCategory === "None" &&
      numericImpactedHours > 0
    ) {
      alert(
        "Select an external impact category for impacted hours."
      );
      return false;
    }

    return true;
  }

  function saveCurrentEntry() {
    if (!selectedProject) {
      return;
    }

    saveEntry({
      employeeName,
      category: "Project Work",
      country: selectedProject.country,
      project: selectedProject.project,
      productType: selectedProject.productType,
      pcsVendor: selectedProject.pcsVendor,
      phase,
      process,
      activity,
      activityDetails:
        activityDetails.trim(),
      workMode,
      workDate,
      startTime: "",
      endTime: "",
      grossHours: numericHoursWorked,
      lunchBreakHours: 0,
      hours: numericHoursWorked,
      regularHours:
        overtimeResult.regularHours,
      otHours: overtimeResult.otHours,
      impactCategory,
      impactedHours:
        numericImpactedHours,
      impactComments:
        impactComments.trim(),
      createdDate:
        new Date().toISOString(),
    });
  }

  function handleSave() {
    if (!validateEntry()) {
      return;
    }

    saveCurrentEntry();
    alert("Entry saved successfully.");
    clearForm();
  }

  function handleSaveAndDuplicate() {
    if (!validateEntry()) {
      return;
    }

    saveCurrentEntry();

    alert(
      "Entry saved. Form retained for the next entry."
    );

    setWorkDate(getTodayValue());
    clearImpact();
  }

  return (
    <div className="card">
      <h2>Time Entry</h2>

      <div className="form-group">
        <label>Logged In User</label>

        <input
          type="text"
          value={employeeName}
          readOnly
        />

        {employeeLogin && (
          <small>{employeeLogin}</small>
        )}

        {userError && (
          <small className="field-error">
            {userError}
          </small>
        )}
      </div>

      <div className="form-group">
        <label>Work Date</label>

        <input
          type="date"
          value={workDate}
          onChange={(event) =>
            setWorkDate(event.target.value)
          }
        />
      </div>

      <div className="form-group">
        <label>Project</label>

        <select
          value={projectKey}
          onChange={(event) =>
            setProjectKey(event.target.value)
          }
        >
          <option value="">
            Select Project
          </option>

          {projectOptions.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>
      </div>

      {selectedProject && (
        <div className="project-meta">
          <small>
            Country: {selectedProject.country}
            {" • "}
            Product: {selectedProject.productType}
            {" • "}
            PCS: {selectedProject.pcsVendor || "N/A"}
          </small>
        </div>
      )}

      <div className="form-group">
        <label>Commissioning Phase</label>

        <select
          value={phase}
          onChange={(event) =>
            setPhase(event.target.value)
          }
        >
          <option value="">
            Select Phase
          </option>

          {phases.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Activity</label>

        <select
          value={activity}
          onChange={(event) =>
            setActivity(event.target.value)
          }
        >
          <option value="">
            Select Activity
          </option>

          {Array.from(
            new Set(
              activityConfig.map(
                (item) => item.process
              )
            )
          ).map((group) => (
            <optgroup
              key={group}
              label={group}
            >
              {activityConfig
                .filter(
                  (item) =>
                    item.process === group
                )
                .map((item) => (
                  <option
                    key={`${group}-${item.activity}`}
                    value={item.activity}
                  >
                    {item.activity}
                  </option>
                ))}
            </optgroup>
          ))}

          <option value="Other">
            Other
          </option>
        </select>
      </div>

      <div className="form-group">
        <label>Activity Details</label>

        <input
          type="text"
          value={activityDetails}
          placeholder="Optional equipment, block, core, or array details"
          onChange={(event) =>
            setActivityDetails(
              event.target.value
            )
          }
        />
      </div>

      <div className="form-group">
        <label>Work Mode</label>

        <select
          value={workMode}
          onChange={(event) =>
            setWorkMode(event.target.value)
          }
        >
          <option value="">
            Select Work Mode
          </option>

          {workModes.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Hours Worked</label>

        <input
          type="number"
          min="0"
          max="24"
          step="0.25"
          value={hoursWorked}
          placeholder="8, 9, 10, 12..."
          onChange={(event) =>
            setHoursWorked(event.target.value)
          }
        />
      </div>

      <div className="stats-grid time-summary-grid">
        <div className="card">
          <h3>Regular Hours</h3>
          <div className="value">
            {overtimeResult.regularHours.toFixed(2)}
          </div>
        </div>

        <div className="card">
          <h3>OT Hours</h3>
          <div className="value ot-value">
            {overtimeResult.otHours.toFixed(2)}
          </div>
        </div>
      </div>

      <details className="impact-section">
        <summary>
          External Impact (Optional)
        </summary>

        <div className="form-group">
          <label>Impact Category</label>

          <select
            value={impactCategory}
            onChange={(event) => {
              const nextCategory =
                event.target.value;

              setImpactCategory(nextCategory);

              if (nextCategory === "None") {
                setImpactedHours("0");
                setImpactComments("");
              }
            }}
          >
            {impactCategories.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>
        </div>

        {impactCategory !== "None" && (
          <>
            <div className="form-group">
              <label>Hours Impacted</label>

              <input
                type="number"
                min="0"
                max={numericHoursWorked}
                step="0.25"
                value={impactedHours}
                onChange={(event) =>
                  setImpactedHours(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="form-group">
              <label>
                Productive Hours After Impact
              </label>

              <input
                type="text"
                value={productiveHours.toFixed(2)}
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Impact Comments</label>

              <input
                type="text"
                value={impactComments}
                placeholder="Describe how the external constraint affected progress"
                onChange={(event) =>
                  setImpactComments(
                    event.target.value
                  )
                }
              />
            </div>
          </>
        )}
      </details>

      {overtimeResult.isWeekend && (
        <div className="ot-notice">
          Weekend rule applied. All worked hours are OT.
        </div>
      )}

      <div className="actions time-entry-actions">
        <button
          onClick={handleSave}
          disabled={
            isLoadingUser || Boolean(userError)
          }
        >
          Save Entry
        </button>

        <button
          type="button"
          className="secondary-btn"
          onClick={handleSaveAndDuplicate}
          disabled={
            isLoadingUser || Boolean(userError)
          }
        >
          Save &amp; Duplicate
        </button>

        <button
          type="button"
          className="secondary-btn"
          onClick={clearForm}
        >
          Clear Form
        </button>
      </div>
    </div>
  );
}

// END OF FILE
