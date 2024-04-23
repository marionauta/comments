import * as logger from "deno/log/mod.ts";
import { getHostAndPathname, getServerHost } from "@/helpers/mod.ts";
import type { CommentResponse, CommHandler } from "@/models/mod.ts";
import { CommentPublished, ServerErrorResponse } from "@/components/mod.tsx";
import { sendTelegramMessage } from "@/telegram/mod.ts";
import { createComment } from "@/db/mod.ts";

export const createCommentHandler: CommHandler = async (
  request,
): Promise<CommentResponse> => {
  const serverHost = getServerHost(request);
  const [hostname, pathname] = getHostAndPathname(request);
  const data = await request.formData();
  const body = data.get("comment");
  const author_name = data.get("author-name") ?? "";
  if (typeof body !== "string" || typeof author_name !== "string") {
    logger.warn("Comment body or author name must be strings");
    return {
      body: ServerErrorResponse({ serverHost }),
    };
  }
  const comment = createComment(hostname, pathname, body, author_name);
  const update =
    `Comment by ${comment.author_name}: ${comment.body} @ ${hostname}${pathname}`;
  logger.info(update);
  sendTelegramMessage(update);
  return {
    body: CommentPublished({ serverHost }),
  };
};
