import UserDebug from "../components/UserDebug";

export default function UserTest() {
  return (
    <>
      <div className="welcome-card">
        <h2>Teams Identity Test</h2>

        <p>
          Verify that ROBIN can
          read the logged-in
          Microsoft Teams user.
        </p>
      </div>

      <UserDebug />
    </>
  );
}

// END OF FILE