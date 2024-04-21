import { render } from "https://esm.sh/preact-render-to-string@6.4.2";
import { STATUS_CODE } from "deno/http/status.ts";
import type { CommentResponse, CommHandler } from "@/models/mod.ts";
import { homeHandler } from "@/handlers/homeHandler.ts";
import { listCommentsHandler } from "@/handlers/listCommentsHandler.ts";
import { createCommentHandler } from "@/handlers/createCommentHandler.ts";

const routes: [string, string, CommHandler][] = [
  ["GET", "/", homeHandler],
  ["GET", "/comments", listCommentsHandler],
  ["POST", "/comments", createCommentHandler],
];

const commentResponseToResponse = (response: CommentResponse): Response => {
  const body = render(response.body);
  const headers = new Headers({
    "content-type": "text/html; charset=utf-8",
  });
  if (response.options?.rewsap) {
    headers.append("hx-reswap", response.options.rewsap);
  }
  return new Response(body, { headers });
};

const handlers: Deno.ServeHandler = async (request) => {
  for (const [method, pathname, handler] of routes) {
    if (
      new URL(request.url).pathname === pathname &&
      [method, "OPTIONS"].includes(request.method)
    ) {
      const response = await handler(request);
      return commentResponseToResponse(response);
    }
  }
  return new Response(null, { status: STATUS_CODE.NotFound });
};

export default handlers;
