import {
  useState,
} from "react";

import useTeamsUser from "../hooks/useTeamsUser";

import {
  getGraphAccessToken,
} from "../services/AuthService";

export default function GraphTest() {
  const {
    employeeName,
  } = useTeamsUser();

  const [
    status,
    setStatus,
  ] = useState(
    "Not Tested"
  );

  const [
    tokenPreview,
    setTokenPreview,
  ] = useState(
    ""
  );

  async function testGraphConnection() {
    try {
      setStatus(
        "Testing..."
      );

      const token =
        await getGraphAccessToken();

      setTokenPreview(
        token.substring(
          0,
          40
        ) + "..."
      );

      setStatus(
        "Connected"
      );
    } catch (error) {
      console.error(
        error
      );

      setStatus(
        "Failed"
      );

      setTokenPreview(
        ""
      );
    }
  }

  return (
    <>
      <div className="welcome-card">
        <h2>
          Microsoft Graph Test
        </h2>

        <p>
          Logged in as{" "}
          <strong>
            {employeeName}
          </strong>
        </p>
      </div>

      <div className="compliance-card">
        <h2>
          Connection Status
        </h2>

        <div className="status-row">
          <span>
            Graph
          </span>

          <strong>
            {status}
          </strong>
        </div>

        {tokenPreview && (
          <>
            <hr />

            <div>
              <strong>
                Token Preview
              </strong>

              <br />

              <small>
                {tokenPreview}
              </small>
            </div>
          </>
        )}

        <br />

        <button
          onClick={
            testGraphConnection
          }
        >
          Test Graph
        </button>
      </div>
    </>
  );
}

// END OF FILE