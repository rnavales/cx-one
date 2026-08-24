import {
  app,
} from "@microsoft/teams-js";

export interface TeamsUser {
  displayName: string;
  loginHint: string;
  userId: string;
}

function formatDisplayName(
  loginHint: string
): string {
  if (!loginHint) {
    return "Unknown User";
  }

  const username =
    loginHint.split("@")[0];

  return username
    .split(/[._-]/)
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1).toLowerCase()
    )
    .join(" ");
}

export async function getCurrentUser(): Promise<TeamsUser> {
  try {
    await app.initialize();

    const context =
      await app.getContext();

    console.log(
      "Teams Context:",
      context
    );

    let displayName =
      context.user?.displayName ||
      "";

    const loginHint =
      context.user?.loginHint ||
      "";

    const userId =
      context.user?.id ||
      "";

    if (
      !displayName ||
      displayName.trim() === ""
    ) {
      displayName =
        formatDisplayName(
          loginHint
        );
    }

    return {
      displayName:
        displayName ||
        "Unknown User",

      loginHint,

      userId,
    };
  } catch (error) {
    console.error(
      "Failed to load Teams user",
      error
    );

    return {
      displayName:
        "Unknown User",
      loginHint: "",
      userId: "",
    };
  }
}

// END OF FILE