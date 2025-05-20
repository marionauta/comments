import logger from "@/logger.ts";
import { getHostAndPathname, getServerHost } from "@/helpers/mod.ts";
import type { HtmxServeHandler } from "@/htmx/preact/index.ts";
import { CommentPublished } from "@/components/mod.tsx";
import { sendTelegramMessage } from "@/telegram/mod.ts";
import { createComment, isDomainAllowed } from "@/db/mod.ts";

export const createCommentHandler: HtmxServeHandler = async (
  request,
  server,
) => {
  const serverHost = getServerHost(request, server);
  const [hostname, pathname] = getHostAndPathname(request);
  if (!isDomainAllowed({ hostname })) {
    throw new Error(`Hostname '${hostname}' not allowed.`);
  }
  const data = await request.formData();
  let body = data.get("comment");
  if (typeof body !== "string") {
    throw new Error("Comment body must be a string");
  }
  body = body.trim();
  if (body.length === 0) {
    throw new Error("Comment body must not be empty");
  }
  const authorName = data.get("author-name");
  if (authorName && typeof authorName !== "string") {
    throw new Error("Comment author name must be a string");
  }
  if (authorName !== null) {
    request.cookies.set({
      name: "author_name",
      value: authorName,
      secure: true,
      httpOnly: true,
      sameSite: "none",
    });
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
    init: {
      status: 201,
    },
  };
};
