export type UserField = "name" | "email" | "is_active";

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

  const detail = "detail" in error ? error.detail : undefined;

  if (typeof detail === "string") {
    result.message = detail;
    return result;
  }

  if (Array.isArray(detail)) {
    const messages: string[] = [];

    for (const item of detail) {
      if (!item || typeof item !== "object") continue;

      const message =
        "msg" in item && typeof item.msg === "string" ? item.msg : undefined;

      const loc = "loc" in item ? item.loc : undefined;

      if (!message) continue;

      if (Array.isArray(loc)) {
        const field = loc.find(
          (part): part is UserField =>
            part === "name" || part === "email" || part === "is_active",
        );

        if (field && !result.fieldErrors[field]) {
          result.fieldErrors[field] = message;
        }
      }

      messages.push(message);
    }

    if (messages.length > 0) {
      result.message = messages.join(" ");
    }

    return result;
  }

  return result;
}
