export const parseOrigin = (url: string) =>
  (url.slice(0, 2) === "//" ? window.location.protocol : "") +
  url.split("/").slice(0, 3).join("/");

export const isString = (value: unknown): value is string =>
  typeof value === "string" || value instanceof String;
