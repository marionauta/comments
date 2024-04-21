export const getServerHost = (request: Request): string => {
  const https = request.headers.get("origin")?.includes("https") ?? true;
  const base = request.headers.get("host") ?? "comments.nachbaur.dev";
  return `${https ? "https" : "http"}://${base}`;
};

export const getHostAndPathname = (request: Request): [string, string] => {
  const currentUrl = request.headers.get("hx-current-url");
  if (typeof currentUrl !== "string") {
    throw new Response(null);
  }
  const parsed = new URL(currentUrl);
  return [parsed.hostname, parsed.pathname];
};
