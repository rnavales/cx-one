import {
  useEffect,
  useState,
} from "react";

import {
  getCurrentUser,
} from "../services/UserService";

interface TeamsUserState {
  employeeName: string;
  employeeLogin: string;
  userId: string;
  isLoadingUser: boolean;
  userError: string;
}

export default function useTeamsUser(): TeamsUserState {
  const [
    employeeName,
    setEmployeeName,
  ] = useState(
    "Loading Teams user..."
  );

  const [
    employeeLogin,
    setEmployeeLogin,
  ] = useState("");

  const [
    userId,
    setUserId,
  ] = useState("");

  const [
    isLoadingUser,
    setIsLoadingUser,
  ] = useState(true);

  const [
    userError,
    setUserError,
  ] = useState("");

  useEffect(() => {
    let mounted =
      true;

    async function loadTeamsUser() {
      try {
        const user =
          await getCurrentUser();

        if (!mounted) {
          return;
        }

        setEmployeeName(
          user.displayName ||
            "Unknown User"
        );

        setEmployeeLogin(
          user.loginHint ||
            ""
        );

        setUserId(
          user.userId ||
            ""
        );

        setUserError(
          ""
        );
      } catch (
        error
      ) {
        console.error(
          "Teams user load failed:",
          error
        );

        if (!mounted) {
          return;
        }

        setEmployeeName(
          "Unknown User"
        );

        setEmployeeLogin(
          ""
        );

        setUserId(
          ""
        );

        setUserError(
          "Unable to retrieve Microsoft Teams user."
        );
      } finally {
        if (
          mounted
        ) {
          setIsLoadingUser(
            false
          );
        }
      }
    }

    loadTeamsUser();

    return () => {
      mounted =
        false;
    };
  }, []);

  return {
    employeeName,
    employeeLogin,
    userId,
    isLoadingUser,
    userError,
  };
}

// END OF FILE