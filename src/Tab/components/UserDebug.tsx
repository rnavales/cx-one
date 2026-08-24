import useTeamsUser from "../hooks/useTeamsUser";

export default function UserDebug() {
  const {
    employeeName,
    employeeLogin,
    isLoadingUser,
    userError,
  } = useTeamsUser();

  return (
    <div className="compliance-card">
      <h2>Teams User Test</h2>

      <div className="entry-row">
        <div>
          <strong>Status</strong>
        </div>

        <div>
          {isLoadingUser
            ? "Loading..."
            : "Ready"}
        </div>
      </div>

      <div className="entry-row">
        <div>
          <strong>Display Name</strong>
        </div>

        <div>
          {employeeName}
        </div>
      </div>

      <div className="entry-row">
        <div>
          <strong>Login</strong>
        </div>

        <div>
          {employeeLogin || "-"}
        </div>
      </div>

      {userError && (
        <div className="ot-notice">
          {userError}
        </div>
      )}
    </div>
  );
}

// END OF FILE
