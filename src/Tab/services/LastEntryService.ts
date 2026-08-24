import {
  getEntries,
} from "../data";

export function getLastEntry(
  employeeName: string
) {
  const entries =
    getEntries()
      .filter(
        (entry) =>
          entry.employeeName ===
          employeeName
      )
      .sort(
        (a, b) =>
          new Date(
            b.createdDate
          ).getTime() -
          new Date(
            a.createdDate
          ).getTime()
      );

  return entries.length > 0
    ? entries[0]
    : null;
}

// END OF FILE