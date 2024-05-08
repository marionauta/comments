import type { HtmxServeHandler } from "deno-htmx/mod.ts";
import { getHostAndPathname, getServerHost } from "@/helpers/mod.ts";
import { CommentSection } from "@/components/mod.tsx";
import { getComments } from "@/db/mod.ts";

export const listCommentsHandler: HtmxServeHandler = (request) => {
  const serverHost = getServerHost(request);
  const [hostname, pathname] = getHostAndPathname(request);
  const comments = getComments(hostname, pathname);
  return {
    body: CommentSection({ comments, serverHost }),
    options: {
      reswap: "outerHTML",
    },
  };
};
