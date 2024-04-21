import { render } from "https://esm.sh/preact-render-to-string@6.4.2";
import { STATUS_CODE } from "deno/http/status.ts";
import * as logger from "deno/log/mod.ts";
import { getHostAndPathname, getServerHost } from "@/helpers/mod.ts";
import type { CommHandler } from "@/models/mod.ts";
import {
  CommentPublished,
  CommentSection,
  ServerErrorResponse,
} from "@/components/mod.tsx";
import { sendTelegramMessage } from "@/telegram/mod.ts";
import { createComment, getComments } from "@/db/mod.ts";

const serveComments: CommHandler = (request) => {
  const serverHost = getServerHost(request);
  const [hostname, pathname] = getHostAndPathname(request);
  const comments = getComments(hostname, pathname);
  return CommentSection({ comments, serverHost });
};

const postComment: CommHandler = async (request) => {
  const serverHost = getServerHost(request);
  const [hostname, pathname] = getHostAndPathname(request);
  const data = await request.formData();
  const body = data.get("comment");
  const author_name = data.get("author-name") ?? "";
  if (typeof body !== "string" || typeof author_name !== "string") {
    logger.warn("Comment body or author name missing");
    return ServerErrorResponse({ serverHost });
  }
  const comment = createComment(hostname, pathname, body, author_name);
  logger.warn(comment.id);
  const update = `Comment by ${author_name}: ${body} @ ${hostname}${pathname}`;
  logger.info(update);
  sendTelegramMessage(update);
  return CommentPublished({ serverHost });
};

const routes: [string, string, CommHandler][] = [
  ["GET", "/comments", serveComments],
  ["POST", "/comments", postComment],
];

const handlers: Deno.ServeHandler = async (request) => {
  for (const [method, pathname, handler] of routes) {
    if (
      new URL(request.url).pathname === pathname &&
      [method, "OPTIONS"].includes(request.method)
    ) {
      const result = await handler(request);
      return new Response(render(result));
    }
  }
  return new Response(null, { status: STATUS_CODE.NotFound });
};

export default handlers;
