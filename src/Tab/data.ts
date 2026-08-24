export interface TimeEntry {
  employeeName: string;

  category: string;

  country: string;
  project: string;
  productType: string;
  pcsVendor: string;

  phase: string;
  process: string;
  activity: string;
  activityDetails: string;

  workMode: string;
  workDate: string;

  hours: number;
  regularHours: number;
  otHours: number;

  impactCategory: string;
  impactedHours: number;
  impactComments: string;

  createdDate: string;

  startTime?: string;
  endTime?: string;
  grossHours?: number;
  lunchBreakHours?: number;
}

const STORAGE_KEY =
  "robin_time_entries";

function normalizeEntry(
  entry: Partial<TimeEntry>
): TimeEntry {
  return {
    employeeName:
      entry.employeeName || "",

    category:
      entry.category ||
      "Project Work",

    country:
      entry.country || "",

    project:
      entry.project || "",

    productType:
      entry.productType || "",

    pcsVendor:
      entry.pcsVendor || "",

    phase:
      entry.phase || "",

    process:
      entry.process || "",

    activity:
      entry.activity || "",

    activityDetails:
      entry.activityDetails || "",

    workMode:
      entry.workMode || "",

    workDate:
      entry.workDate ||
      entry.createdDate?.substring(
        0,
        10
      ) ||
      "",

    hours:
      Number(
        entry.hours || 0
      ),

    regularHours:
      Number(
        entry.regularHours || 0
      ),

    otHours:
      Number(
        entry.otHours || 0
      ),

    impactCategory:
      entry.impactCategory ||
      "None",

    impactedHours:
      Number(
        entry.impactedHours || 0
      ),

    impactComments:
      entry.impactComments || "",

    createdDate:
      entry.createdDate ||
      new Date().toISOString(),

    startTime:
      entry.startTime || "",

    endTime:
      entry.endTime || "",

    grossHours:
      Number(
        entry.grossHours ||
        entry.hours ||
        0
      ),

    lunchBreakHours:
      Number(
        entry.lunchBreakHours ||
        0
      ),
  };
}

export function getEntries(): TimeEntry[] {
  const storedData =
    localStorage.getItem(
      STORAGE_KEY
    );

  if (!storedData) {
    return [];
  }

  try {
    const parsedData =
      JSON.parse(
        storedData
      );

    if (
      !Array.isArray(
        parsedData
      )
    ) {
      return [];
    }

    return parsedData.map(
      (entry) =>
        normalizeEntry(
          entry
        )
    );
  } catch (
    error
  ) {
    console.error(
      "Unable to read time entries.",
      error
    );

    return [];
  }
}

export function saveEntry(
  entry: TimeEntry
): void {
  const entries =
    getEntries();

  const normalizedEntry =
    normalizeEntry(
      entry
    );

  entries.push(
    normalizedEntry
  );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      entries
    )
  );
}

export function deleteEntry(
  index: number
): void {
  const entries =
    getEntries();

  if (
    index < 0 ||
    index >= entries.length
  ) {
    return;
  }

  entries.splice(
    index,
    1
  );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      entries
    )
  );
}

export function clearEntries(): void {
  localStorage.removeItem(
    STORAGE_KEY
  );
}

// END OF FILE