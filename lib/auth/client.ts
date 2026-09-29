"use client";

export async function adminFetch(input: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, { ...init, credentials: "same-origin", cache: "no-store" });
  if (response.status === 401 || response.status === 403) {
    window.location.replace("/admin/login");
    throw new Error("Admin session expired. Please sign in again.");
  }
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const message = data?.error || "The request failed. Please try again.";
    window.alert(message);
    throw new Error(message);
  }
  return response;
}
