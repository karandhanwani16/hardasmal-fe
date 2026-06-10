import { isAxiosError } from "axios";

type LaravelErrorPayload = {
  message?: string;
  errors?: Record<string, string[]>;
};

export function getApiErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (!isAxiosError(error)) {
    return fallback;
  }

  const data = error.response?.data as LaravelErrorPayload | undefined;
  if (!data) {
    return fallback;
  }

  if (data.errors) {
    const fieldMessages = Object.values(data.errors)
      .flat()
      .filter((message): message is string => Boolean(message));

    if (fieldMessages.length > 0) {
      return fieldMessages.join(" ");
    }
  }

  if (typeof data.message === "string" && data.message.trim() !== "") {
    return data.message;
  }

  return fallback;
}
