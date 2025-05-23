import type { BunRequest, Server } from "bun";

export const getServerHost = (request: BunRequest, server: Server): string => {
  const https = request.headers.get("origin")?.includes("https") ?? true;
  const base = request.headers.get("host") ?? server.hostname;
  return `${https ? "https" : "http"}://${base}`;
};

export const getHostAndPathname = (request: Request): [string, string] => {
  const currentUrl = request.headers.get("hx-current-url");
  if (typeof currentUrl !== "string") {
    throw new Error("Missing hx-current-url header");
  }
  const parsed = new URL(currentUrl);
  return [parsed.hostname, parsed.pathname];
};
