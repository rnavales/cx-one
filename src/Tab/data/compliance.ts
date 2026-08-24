export interface ComplianceRecord {
  employeeName: string;
  timesheetStatus: string;
  lmsStatus: string;
  concurStatus: string;
  safetyWalkStatus: string;
  updatedDate: string;
}

const STORAGE_KEY =
  "robin_compliance";

export function getComplianceRecords(): ComplianceRecord[] {
  const data =
    localStorage.getItem(
      STORAGE_KEY
    );

  if (!data) {
    return [];
  }

  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveComplianceRecord(
  record: ComplianceRecord
): void {
  const records =
    getComplianceRecords();

  const existingIndex =
    records.findIndex(
      (item) =>
        item.employeeName ===
        record.employeeName
    );

  if (
    existingIndex >= 0
  ) {
    records[
      existingIndex
    ] = record;
  } else {
    records.push(
      record
    );
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(records)
  );
}

export function getComplianceByUser(
  employeeName: string
): ComplianceRecord | undefined {
  return getComplianceRecords().find(
    (item) =>
      item.employeeName ===
      employeeName
  );
}

// END OF FILE