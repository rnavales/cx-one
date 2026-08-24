import {
  useEffect,
  useState,
} from "react";

import useTeamsUser from "./useTeamsUser";

export default function useBetaUser() {
  const {
    employeeName,
    employeeLogin,
  } = useTeamsUser();

  const [
    displayName,
    setDisplayName,
  ] = useState("");

  useEffect(() => {
    if (
      employeeName &&
      employeeName !==
        "Unknown User" &&
      employeeName !==
        "Loading Teams user..."
    ) {
      setDisplayName(
        employeeName
      );

      return;
    }

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
  }, [
    employeeName,
  ]);

  return {
    employeeName:
      displayName,
    employeeLogin,
    isLoadingUser: false,
    userError: "",
  };
}

// END OF FILE
