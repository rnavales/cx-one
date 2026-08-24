export interface SharePointTimeEntryInput {
  employeeLookupId: number;
  workDate: string;
  category: string;
  country: string;
  project: string;
  workMode: string;
  activity: string;
  startTime: string;
  endTime: string;
  workedHours: number;
  regularHours: number;
  otHours: number;
  entrySource: string;
  teamsUserId: string;
  createdDate?: string;
  lastModifiedDate?: string;
}

export interface SharePointTimeEntry extends SharePointTimeEntryInput {
  id: string;
  title: string;
  employeeDisplayName: string;
  createdDateTime: string;
  lastModifiedDateTime: string;
}

interface GraphSite {
  id: string;
}

interface GraphListItem {
  id: string;
  createdDateTime?: string;
  lastModifiedDateTime?: string;
  fields?: Record<string, unknown>;
}

interface GraphListItemsResponse {
  value: GraphListItem[];
  "@odata.nextLink"?: string;
}

const GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0";

const SHAREPOINT_HOSTNAME =
  import.meta.env.VITE_SHAREPOINT_HOSTNAME ||
  "fluenceenergy.sharepoint.com";

const SHAREPOINT_SITE_PATH =
  import.meta.env.VITE_SHAREPOINT_SITE_PATH ||
  "/sites/APACCommissioningTeam";

const TIME_ENTRIES_LIST_ID =
  import.meta.env.VITE_TIME_ENTRIES_LIST_ID ||
  "7B5D1AA4-EB0B-43D3-836B-C3239D8D7849";

const EMPLOYEE_FIELD_INTERNAL_NAME =
  import.meta.env.VITE_EMPLOYEE_FIELD_INTERNAL_NAME ||
  "Employee";

let cachedSiteId = "";

function requireAccessToken(accessToken: string): void {
  if (!accessToken.trim()) {
    throw new Error("A Microsoft Graph access token is required.");
  }
}

function createHeaders(accessToken: string): HeadersInit {
  requireAccessToken(accessToken);

  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

async function readGraphError(response: Response): Promise<string> {
  try {
    const body = await response.json();

    return (
      body?.error?.message ||
      body?.message ||
      response.statusText ||
      "Unknown Microsoft Graph error"
    );
  } catch {
    return response.statusText || "Unknown Microsoft Graph error";
  }
}

async function ensureSuccessfulResponse(response: Response): Promise<void> {
  if (response.ok) {
    return;
  }

  const message = await readGraphError(response);

  throw new Error(
    `Microsoft Graph request failed (${response.status}): ${message}`
  );
}

function toText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDateOnly(value: unknown): string {
  const text = toText(value);
  return text ? text.substring(0, 10) : "";
}

function createTitle(entry: SharePointTimeEntryInput): string {
  return `${entry.project} - ${entry.workDate}`;
}

function createFieldsPayload(
  entry: SharePointTimeEntryInput
): Record<string, unknown> {
  const createdDate = entry.createdDate || new Date().toISOString();
  const lastModifiedDate =
    entry.lastModifiedDate || new Date().toISOString();

  return {
    Title: createTitle(entry),
    [`${EMPLOYEE_FIELD_INTERNAL_NAME}LookupId`]: entry.employeeLookupId,
    WorkDate: entry.workDate,
    Category: entry.category,
    Country: entry.country,
    Project: entry.project,
    WorkMode: entry.workMode,
    Activity: entry.activity,
    StartTime: entry.startTime,
    EndTime: entry.endTime,
    WorkedHours: entry.workedHours,
    RegularHours: entry.regularHours,
    OTHours: entry.otHours,
    CreatedDate: createdDate,
    EntrySource: entry.entrySource || "CX One",
    TeamsUserId: entry.teamsUserId,
    LastModifiedDate: lastModifiedDate,
  };
}

function mapListItem(item: GraphListItem): SharePointTimeEntry {
  const fields = item.fields || {};

  return {
    id: item.id,
    title: toText(fields.Title),
    employeeLookupId: toNumber(
      fields[`${EMPLOYEE_FIELD_INTERNAL_NAME}LookupId`]
    ),
    employeeDisplayName: toText(fields[EMPLOYEE_FIELD_INTERNAL_NAME]),
    workDate: normalizeDateOnly(fields.WorkDate),
    category: toText(fields.Category),
    country: toText(fields.Country),
    project: toText(fields.Project),
    workMode: toText(fields.WorkMode),
    activity: toText(fields.Activity),
    startTime: toText(fields.StartTime),
    endTime: toText(fields.EndTime),
    workedHours: toNumber(fields.WorkedHours),
    regularHours: toNumber(fields.RegularHours),
    otHours: toNumber(fields.OTHours),
    entrySource: toText(fields.EntrySource),
    teamsUserId: toText(fields.TeamsUserId),
    createdDate: toText(fields.CreatedDate),
    lastModifiedDate: toText(fields.LastModifiedDate),
    createdDateTime: item.createdDateTime || "",
    lastModifiedDateTime: item.lastModifiedDateTime || "",
  };
}

export async function getSharePointSiteId(
  accessToken: string
): Promise<string> {
  if (cachedSiteId) {
    return cachedSiteId;
  }

  const encodedPath = SHAREPOINT_SITE_PATH
.split("/")
.map(
(segment: string): string =>
encodeURIComponent(segment)
)
.join("/");

  const url =
    `${GRAPH_BASE_URL}/sites/` +
    `${SHAREPOINT_HOSTNAME}:${encodedPath}`;

  const response = await fetch(url, {
    method: "GET",
    headers: createHeaders(accessToken),
  });

  await ensureSuccessfulResponse(response);

  const site = (await response.json()) as GraphSite;

  if (!site.id) {
    throw new Error("Microsoft Graph did not return a SharePoint site ID.");
  }

  cachedSiteId = site.id;
  return cachedSiteId;
}

async function getListItemsBaseUrl(accessToken: string): Promise<string> {
  const siteId = await getSharePointSiteId(accessToken);

  return (
    `${GRAPH_BASE_URL}/sites/${siteId}` +
    `/lists/${TIME_ENTRIES_LIST_ID}/items`
  );
}

export async function createSharePointTimeEntry(
  accessToken: string,
  entry: SharePointTimeEntryInput
): Promise<SharePointTimeEntry> {
  if (!Number.isInteger(entry.employeeLookupId) || entry.employeeLookupId <= 0) {
    throw new Error(
      "employeeLookupId must be a positive SharePoint numeric user ID."
    );
  }

  const baseUrl = await getListItemsBaseUrl(accessToken);

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: createHeaders(accessToken),
    body: JSON.stringify({
      fields: createFieldsPayload(entry),
    }),
  });

  await ensureSuccessfulResponse(response);

  const createdItem = (await response.json()) as GraphListItem;

  if (!createdItem.fields) {
    return getSharePointTimeEntry(accessToken, createdItem.id);
  }

  return mapListItem(createdItem);
}

export async function getSharePointTimeEntry(
  accessToken: string,
  itemId: string
): Promise<SharePointTimeEntry> {
  if (!itemId.trim()) {
    throw new Error("A SharePoint list item ID is required.");
  }

  const baseUrl = await getListItemsBaseUrl(accessToken);
  const url = `${baseUrl}/${encodeURIComponent(itemId)}?expand=fields`;

  const response = await fetch(url, {
    method: "GET",
    headers: createHeaders(accessToken),
  });

  await ensureSuccessfulResponse(response);

  return mapListItem((await response.json()) as GraphListItem);
}

export async function getSharePointTimeEntries(
  accessToken: string
): Promise<SharePointTimeEntry[]> {
  const baseUrl = await getListItemsBaseUrl(accessToken);

  let nextUrl = `${baseUrl}?expand=fields&$top=200`;
  const entries: SharePointTimeEntry[] = [];

  while (nextUrl) {
    const response = await fetch(nextUrl, {
      method: "GET",
      headers: createHeaders(accessToken),
    });

    await ensureSuccessfulResponse(response);

    const page = (await response.json()) as GraphListItemsResponse;

    entries.push(...page.value.map(mapListItem));
    nextUrl = page["@odata.nextLink"] || "";
  }

  return entries.sort((first, second) => {
    const firstDate = new Date(
      first.createdDate || first.createdDateTime || first.workDate
    ).getTime();

    const secondDate = new Date(
      second.createdDate || second.createdDateTime || second.workDate
    ).getTime();

    return secondDate - firstDate;
  });
}

export async function getSharePointTimeEntriesByTeamsUserId(
  accessToken: string,
  teamsUserId: string
): Promise<SharePointTimeEntry[]> {
  const entries = await getSharePointTimeEntries(accessToken);

  return entries.filter(
    (entry) => entry.teamsUserId.toLowerCase() === teamsUserId.toLowerCase()
  );
}

export async function updateSharePointTimeEntry(
  accessToken: string,
  itemId: string,
  entry: SharePointTimeEntryInput
): Promise<SharePointTimeEntry> {
  if (!itemId.trim()) {
    throw new Error("A SharePoint list item ID is required.");
  }

  const baseUrl = await getListItemsBaseUrl(accessToken);
  const url = `${baseUrl}/${encodeURIComponent(itemId)}/fields`;

  const payload = createFieldsPayload({
    ...entry,
    lastModifiedDate: new Date().toISOString(),
  });

  const response = await fetch(url, {
    method: "PATCH",
    headers: createHeaders(accessToken),
    body: JSON.stringify(payload),
  });

  await ensureSuccessfulResponse(response);

  return getSharePointTimeEntry(accessToken, itemId);
}

export async function deleteSharePointTimeEntry(
  accessToken: string,
  itemId: string
): Promise<void> {
  if (!itemId.trim()) {
    throw new Error("A SharePoint list item ID is required.");
  }

  const baseUrl = await getListItemsBaseUrl(accessToken);
  const url = `${baseUrl}/${encodeURIComponent(itemId)}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: createHeaders(accessToken),
  });

  await ensureSuccessfulResponse(response);
}

export function clearSharePointSiteIdCache(): void {
  cachedSiteId = "";
}

// END OF FILE
