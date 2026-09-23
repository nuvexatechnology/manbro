/**
 * Service / Data Access Layer
 * Handle queries, external service API calls, and business logic here.
 */

export async function getAppData() {
  return {
    status: "active",
    timestamp: new Date().toISOString(),
  };
}
