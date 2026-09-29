"use server";

/**
 * Next.js Server Actions
 * Export async functions here to handle backend mutations & actions.
 */

export async function exampleServerAction(formData: FormData) {
  try {
    const title = formData.get("title")?.toString() ?? "";
    return { success: true, message: `Action executed for: ${title}` };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}
