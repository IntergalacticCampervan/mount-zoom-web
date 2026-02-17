const COMMENTS_ENDPOINT = "/api/comments";

export class CommentsApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "CommentsApiError";
    this.status = status;
  }
}

export const getNzTrailId = (date = new Date()) => {
  const formatter = new Intl.DateTimeFormat("en-NZ", {
    timeZone: "Pacific/Auckland",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
};

const parseJsonOrThrow = async (response) => {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new CommentsApiError("Unexpected response", response.status);
  }
  return response.json();
};

export const listComments = async (trailId, limit = 50) => {
  const url = new URL(COMMENTS_ENDPOINT, window.location.origin);
  url.searchParams.set("trailId", trailId);
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new CommentsApiError("Failed to load comments", response.status);
  }

  const payload = await parseJsonOrThrow(response);
  return Array.isArray(payload) ? payload : [];
};

export const createComment = async (payload) => {
  const response = await fetch(COMMENTS_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new CommentsApiError("Failed to create comment", response.status);
  }

  return parseJsonOrThrow(response);
};
