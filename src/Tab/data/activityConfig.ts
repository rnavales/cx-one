export interface ActivityConfig {
  process: string;
  activity: string;
}

export const activityConfig: ActivityConfig[] = [
  // Inspection
  {
    process: "Inspection",
    activity: "Array Telco Inspection",
  },
  {
    process: "Inspection",
    activity: "Fiber Loops Inspection and Test",
  },
  {
    process: "Inspection",
    activity: "Equipment Inspection",
  },
  {
    process: "Inspection",
    activity: "Cabling Inspection",
  },
  {
    process: "Inspection",
    activity: "Mechanical Completion Verification",
  },
  {
    process: "Inspection",
    activity: "Smartstack Inspection",
  },

  // Energization
  {
    process: "Energization",
    activity: "Array Telco Energization",
  },
  {
    process: "Energization",
    activity: "Auxiliary Power Energization",
  },
  {
    process: "Energization",
    activity: "Equipment Energization",
  },
  {
    process: "Energization",
    activity: "MV Energization Support",
  },
  {
    process: "Energization",
    activity: "Energization and Soaking",
  },
  {
    process: "Energization",
    activity: "Smartstack Energization",
  },

  // Configuration
  {
    process: "Configuration",
    activity: "Controls Configuration",
  },
  {
    process: "Configuration",
    activity: "Network Configuration",
  },
  {
    process: "Configuration",
    activity: "Equipment Configuration",
  },
  {
    process: "Configuration",
    activity: "Parameter Configuration",
  },
  {
    process: "Configuration",
    activity: "VPN Tunnel Configuration",
  },
  {
    process: "Configuration",
    activity: "Core Playbook Deployments",
  },

  // Verification
  {
    process: "Verification",
    activity: "Communications Verification",
  },
  {
    process: "Verification",
    activity: "Functional Verification",
  },
  {
    process: "Verification",
    activity: "I/O Verification",
  },
  {
    process: "Verification",
    activity: "Protection Verification",
  },
  {
    process: "Verification",
    activity: "PCS Verification",
  },
  {
    process: "Verification",
    activity: "E-Stop Verification",
  },
  {
    process: "Verification",
    activity: "Fire Protection Verification",
  },

  // Testing
  {
    process: "Testing",
    activity: "Core-Level Testing",
  },
  {
    process: "Testing",
    activity: "Array-Level Testing",
  },
  {
    process: "Testing",
    activity: "SAT / Customer Acceptance Testing",
  },
  {
    process: "Testing",
    activity: "Performance Testing",
  },
  {
    process: "Testing",
    activity: "Operational Testing",
  },
];

export const activityOptions =
  activityConfig.map(
    (item) => item.activity
  );

export function getProcessForActivity(
  activity: string
): string {
  const match =
    activityConfig.find(
      (item) =>
        item.activity ===
        activity
    );

  return (
    match?.process ||
    "Other"
  );
}

export function getActivitiesByProcess(
  process: string
): string[] {
  return activityConfig
    .filter(
      (item) =>
        item.process ===
        process
    )
    .map(
      (item) =>
        item.activity
    );
}

// END OF FILE