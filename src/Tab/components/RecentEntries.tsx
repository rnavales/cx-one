import type {
  TimeEntry,
} from "../data";

interface RecentEntriesProps {
  entries: TimeEntry[];
  onDelete: (
    entry: TimeEntry
  ) => void;
}

export default function RecentEntries({
  entries,
  onDelete,
}: RecentEntriesProps) {
  const sortedEntries =
    [...entries].sort(
      (first, second) =>
        new Date(
          second.createdDate
        ).getTime() -
        new Date(
          first.createdDate
        ).getTime()
    );

  return (
    <div className="card">
      <h2>
        Recent Entries
      </h2>

      {sortedEntries.length ===
      0 ? (
        <p>
          No entries found.
        </p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Project</th>
                <th>Phase</th>
                <th>Activity</th>
                <th>Hours</th>
                <th>OT</th>
                <th>Impact</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {sortedEntries.map(
                (
                  entry,
                  index
                ) => (
                  <tr
                    key={`${entry.createdDate}-${index}`}
                  >
                    <td>
                      {entry.workDate}
                    </td>

                    <td>
                      {entry.project}
                    </td>

                    <td>
                      {entry.phase}
                    </td>

                    <td>
                      <div>
                        <strong>
                          {
                            entry.activity
                          }
                        </strong>

                        {entry.activityDetails && (
                          <div
                            style={{
                              fontSize:
                                "0.8rem",
                              opacity:
                                0.7,
                            }}
                          >
                            {
                              entry.activityDetails
                            }
                          </div>
                        )}
                      </div>
                    </td>

                    <td>
                      {Number(
                        entry.hours ||
                          0
                      ).toFixed(
                        2
                      )}
                    </td>

                    <td>
                      {Number(
                        entry.otHours ||
                          0
                      ).toFixed(
                        2
                      )}
                    </td>

                    <td>
                      {entry.impactCategory &&
                      entry.impactCategory !==
                        "None" ? (
                        <>
                          {
                            entry.impactCategory
                          }

                          <br />

                          <small>
                            (
                            {Number(
                              entry.impactedHours ||
                                0
                            ).toFixed(
                              2
                            )}
                            h)
                          </small>
                        </>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() =>
                          onDelete(
                            entry
                          )
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// END OF FILE