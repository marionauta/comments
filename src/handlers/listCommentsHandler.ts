import type { HtmxServeHandler } from "@/htmx/preact/index.ts";
import { getHostAndPathname, getServerHost } from "@/helpers/mod.ts";
import { CommentSection } from "@/components/mod.tsx";
import { getComments } from "@/db/mod.ts";

export const listCommentsHandler: HtmxServeHandler = (request) => {
  const serverHost = getServerHost(request);
  const [hostname, pathname] = getHostAndPathname(request);
  const requestParams = new URL(request.url).searchParams;
  const authorName = requestParams.get("author_name") ?? undefined;
  const comments = getComments({ hostname, pathname });
  return {
    body: CommentSection({ comments, serverHost, authorName }),
    options: {
      reswap: "outerHTML",
    },
  };
};
