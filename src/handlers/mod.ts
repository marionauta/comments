import { nanoid } from "https://deno.land/x/nanoid@v3.0.0/mod.ts";
import { render } from "https://esm.sh/preact-render-to-string@6.4.2";
import { STATUS_CODE } from "deno/http/status.ts";
import * as logger from "deno/log/mod.ts";
import { getHostAndPathname, getServerHost } from "@/helpers/mod.ts";
import type { Comment, CommHandler } from "@/models/mod.ts";
import { CommentPublished, CommentSection } from "@/components/mod.tsx";
import { sendTelegramMessage } from "@/telegram/mod.ts";
import { db } from "@/db/mod.ts";

const serveComments: CommHandler = (request) => {
  const serverHost = getServerHost(request);
  const [hostname, pathname] = getHostAndPathname(request);
  const comments = db.queryEntries<Comment>(
    "select author_name, created_at, body from comments where hostname = ? and pathname = ? order by created_at desc limit 10",
    [hostname, pathname],
  );
  return CommentSection({ comments, serverHost });
};

const postComment: CommHandler = async (request) => {
  const serverHost = getServerHost(request);
  const [hostname, pathname] = getHostAndPathname(request);
  const data = await request.formData();
  const comment = data.get("comment");
  const author_name = data.get("author-name") ?? "";
  if (typeof comment === "string" && typeof author_name == "string") {
    const id = nanoid();
    db.query(
      "insert into comments (id, hostname, pathname, body, author_name) values (?, ?, ?, ?, ?)",
      [id, hostname, pathname, comment, author_name],
    );
    const update =
      `Comment by ${author_name}: ${comment} @ ${hostname}${pathname}`;
    logger.info(update);
    sendTelegramMessage(update);
  }
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
