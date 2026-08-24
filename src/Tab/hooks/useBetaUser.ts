import {
  useEffect,
  useState,
} from "react";

import useTeamsUser from "./useTeamsUser";

export default function useBetaUser() {
  const [
    displayName,
    setDisplayName,
  ] = useState("");

  const [
    login,
    setLogin,
  ] = useState("");

  useEffect(() => {
    const runningInsideTeams =
      window.self !==
      window.top;

    async function loadUser() {
      if (!runningInsideTeams) {
        const savedName =
          localStorage.getItem(
            "cxone_beta_user"
          );

        if (
          savedName &&
          savedName.trim() !== ""
        ) {
          setDisplayName(
            savedName
          );

          return;
        }

        const enteredName =
          window.prompt(
            "Beta Testing: Enter your name"
          );

        if (
          enteredName &&
          enteredName.trim() !== ""
        ) {
          localStorage.setItem(
            "cxone_beta_user",
            enteredName.trim()
          );

          setDisplayName(
            enteredName.trim()
          );
        }

        return;
      }

      try {
        const user =
          await useTeamsUser();

        if (
          user.employeeName &&
          user.employeeName !==
            "Unknown User"
        ) {
          setDisplayName(
            user.employeeName
          );

          setLogin(
            user.employeeLogin ||
              ""
          );
        }
      } catch {
        setDisplayName(
          "Beta User"
        );
      }
    }

    loadUser();
  }, []);

  return {
    employeeName:
      displayName,
    employeeLogin:
      login,
    isLoadingUser:
      false,
    userError: "",
  };
}

// END OF FILE