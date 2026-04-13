const LAST_CLOUD_SYNC_KEY = "dashboard-last-cloud-sync";

/**
 * Records when dashboard state was last successfully upserted to Supabase
 * (see AuthCallbackClient). Ongoing edits are not written to the DB today.
 */
export function setLastCloudSyncTimestamp(iso: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAST_CLOUD_SYNC_KEY, iso);
  } catch {
    // ignore quota / private mode
  }
}

export function getLastCloudSyncTimestamp(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(LAST_CLOUD_SYNC_KEY);
  } catch {
    return null;
  }
}
