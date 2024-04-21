import type { CommHandler } from "@/models/mod.ts";
import { getHostAndPathname, getServerHost } from "@/helpers/mod.ts";
import { CommentSection } from "@/components/mod.tsx";
import { getComments } from "@/db/mod.ts";

export const listCommentsHandler: CommHandler = (request) => {
  const serverHost = getServerHost(request);
  const [hostname, pathname] = getHostAndPathname(request);
  const comments = getComments(hostname, pathname);
  return CommentSection({ comments, serverHost });
};
