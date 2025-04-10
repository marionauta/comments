import type { HtmxServeHandler } from "@/htmx/preact/index.ts";
import { getHostAndPathname, getServerHost } from "@/helpers/mod.ts";
import { CommentSection } from "@/components/mod.tsx";
import { getComments } from "@/db/mod.ts";

export const listCommentsHandler: HtmxServeHandler = (request, server) => {
  const serverHost = getServerHost(request, server);
  const [hostname, pathname] = getHostAndPathname(request);
  const requestParams = new URL(request.url).searchParams;
  const authorName =
    request.cookies.get("author_name") ||
    requestParams.get("author_name") ||
    undefined;
  const comments = getComments({ hostname, pathname });
  return {
    body: CommentSection({ comments, serverHost, authorName }),
    options: {
      reswap: "outerHTML",
    },
  };
};
