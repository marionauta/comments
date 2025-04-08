import logger from "@/logger.ts";
import { getHostAndPathname, getServerHost } from "@/helpers/mod.ts";
import type { HtmxServeHandler } from "@/htmx/preact/index.ts";
import { CommentPublished, ServerErrorResponse } from "@/components/mod.tsx";
import { sendTelegramMessage } from "@/telegram/mod.ts";
import { createComment } from "@/db/mod.ts";

export const createCommentHandler: HtmxServeHandler = async (request) => {
  const serverHost = getServerHost(request);
  const [hostname, pathname] = getHostAndPathname(request);
  const data = await request.formData();
  const body = data.get("comment");
  if (typeof body !== "string") {
    logger.warn("Comment body must be a string");
    return {
      body: ServerErrorResponse({ serverHost }),
    };
  }
  const authorName = data.get("author-name");
  if (authorName && typeof authorName !== "string") {
    logger.warn("Comment author name must be a string");
    return {
      body: ServerErrorResponse({ serverHost }),
    };
  }
  const comment = createComment({
    hostname,
    pathname,
    body,
    author_name: authorName,
  });
  const update = `Comment by ${comment.author_name}: ${comment.body} @ ${hostname}${pathname}`;
  logger.info(update);
  sendTelegramMessage(update);
  return {
    body: CommentPublished({ serverHost, authorName }),
  };
};
