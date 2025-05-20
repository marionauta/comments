import type { HtmxServeHandler } from "@/htmx/preact/index.ts";
import { getHostAndPathname } from "@/helpers/mod.ts";
import { HostCommentSection } from "@/components/mod.tsx";
import { getHostComments } from "@/db/mod.ts";

export const listHostCommentsHandler: HtmxServeHandler = (request) => {
  const [hostname] = getHostAndPathname(request);
  const comments = getHostComments({ hostname });
  return {
    body: HostCommentSection({ comments }),
    options: {
      reswap: "outerHTML",
    },
  };
};
