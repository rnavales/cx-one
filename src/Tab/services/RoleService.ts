import { managers } from "../data/managers";

export function isManager(
  loginHint: string
): boolean {
  return managers.includes(
    loginHint.toLowerCase()
  );
}

// END OF FILE