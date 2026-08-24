export default function ManagerResetTools() {
  function resetCompliance() {
    const confirmed =
      window.confirm(
        "Delete all compliance records?"
      );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(
      "robin_compliance"
    );

    window.location.reload();
  }

  function resetTimeEntries() {
    const confirmed =
      window.confirm(
        "Delete all time entries?"
      );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(
      "robin_time_entries"
    );

    window.location.reload();
  }

  function resetEverything() {
    const confirmed =
      window.confirm(
        "Delete ALL CX One test data?"
      );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(
      "robin_compliance"
    );

    localStorage.removeItem(
      "robin_time_entries"
    );

    window.location.reload();
  }

  return (
    <div className="compliance-card">
      <h2>
        Developer Tools
      </h2>

      <p>
        Use only while testing CX One.
      </p>

      <div className="actions">
        <button
          className="delete-btn"
          onClick={
            resetCompliance
          }
        >
          Reset Compliance
        </button>

        <button
          className="delete-btn"
          onClick={
            resetTimeEntries
          }
        >
          Reset Time Entries
        </button>

        <button
          className="delete-btn"
          onClick={
            resetEverything
          }
        >
          Reset Everything
        </button>
      </div>
    </div>
  );
}

// END OF FILE