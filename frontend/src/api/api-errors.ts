export type UserField = "name" | "email" | "phoneNumber" | "isActive";

export type ApiErrorDetails = {
  message: string;
  fieldErrors: Partial<Record<UserField, string>>;
};

export function parseApiError(error: unknown): ApiErrorDetails {
  const result: ApiErrorDetails = {
    message: "The request failed. Please try again.",
    fieldErrors: {},
  };

  if (!error || typeof error !== "object") {
    return result;
  }

  if ("message" in error && typeof error.message === "string") {
    result.message = error.message;
  }

  if ("detail" in error) {
    const detail = error.detail;

    if (typeof detail === "string") {
      result.message = detail;
    }

    if (Array.isArray(detail)) {
      for (const item of detail) {
        if (!item || typeof item !== "object") continue;

        const message =
          "msg" in item && typeof item.msg === "string" ? item.msg : undefined;

        const loc = "loc" in item ? item.loc : undefined;

        if (!message || !Array.isArray(loc)) continue;

        const field = loc.find(
          (part): part is UserField =>
            part === "name" ||
            part === "email" ||
            part === "phoneNumber" ||
            part === "isActive",
        );

        if (field && !result.fieldErrors[field]) {
          result.fieldErrors[field] = message;
        }
      }
    }
  }

  return result;
}
