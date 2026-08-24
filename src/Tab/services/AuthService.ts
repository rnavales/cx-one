export async function getGraphAccessToken(): Promise<string> {
  throw new Error(
    "Graph authentication is not configured yet."
  );
}

export async function signIn(): Promise<void> {
  return;
}

export async function signOut(): Promise<void> {
  return;
}

// END OF FILE