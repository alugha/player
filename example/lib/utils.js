export const parseOrigin = (url) => (url.slice(0, 2) === "//" ? window.location.protocol : "") +
    url.split("/").slice(0, 3).join("/");
export const isString = (value) => typeof value === "string" || value instanceof String;
