export interface ProjectConfig {
  country: string;
  project: string;
  productType: string;
  pcsVendor: string;
}

export const projectConfig: Record<
  string,
  ProjectConfig
> = {
  "AU - Mortlake": {
    country: "AU",
    project: "Mortlake",
    productType: "Gen6",
    pcsVendor: "SMA",
  },

  "AU - Liddell": {
    country: "AU",
    project: "Liddell",
    productType: "Gen6",
    pcsVendor: "PowerElectronics",
  },

  "AU - Tomago": {
    country: "AU",
    project: "Tomago",
    productType: "GSP5K",
    pcsVendor: "PowerElectronics",
  },

  "AU - Bulabul": {
    country: "AU",
    project: "Bulabul",
    productType: "Gen6",
    pcsVendor: "PowerElectronics",
  },

  "TW - AIDC": {
    country: "TW",
    project: "AIDC",
    productType: "GSP5K",
    pcsVendor: "SMA",
  },

  "TW - DHJ": {
    country: "TW",
    project: "DHJ",
    productType: "SmartStack",
    pcsVendor: "",
  },

  "TW - HEXA": {
    country: "TW",
    project: "HEXA",
    productType: "GSP5K",
    pcsVendor: "PowerElectronics",
  },

  "PH - Tabango": {
    country: "PH",
    project: "Tabango",
    productType: "ADV5",
    pcsVendor: "PowerElectronics",
  },

  "PH - Pitogo": {
    country: "PH",
    project: "Pitogo",
    productType: "ADV5",
    pcsVendor: "PowerElectronics",
  },

  "PH - Ambuklao": {
    country: "PH",
    project: "Ambuklao",
    productType: "SmartStack",
    pcsVendor: "EPC",
  },

  "CN - Singamas": {
    country: "CN",
    project: "Singamas",
    productType: "SmartStack",
    pcsVendor: "Kehua",
  },

  "CN - Envicool": {
    country: "CN",
    project: "Envicool",
    productType: "SmartStack",
    pcsVendor: "Kehua",
  },
};

export const projectOptions =
  Object.keys(projectConfig).sort();

export function getProjectConfig(
  projectKey: string
): ProjectConfig | null {
  return (
    projectConfig[
      projectKey
    ] || null
  );
}

// END OF FILE