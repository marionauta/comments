import { render } from "https://esm.sh/preact-render-to-string@6.4.2";
import { STATUS_CODE } from "deno/http/status.ts";
import type { CommHandler } from "@/models/mod.ts";
import { homeHandler } from "@/handlers/homeHandler.ts";
import { listCommentsHandler } from "@/handlers/listCommentsHandler.ts";
import { createCommentHandler } from "@/handlers/createCommentHandler.ts";

const routes: [string, string, CommHandler][] = [
  ["GET", "/", homeHandler],
  ["GET", "/comments", listCommentsHandler],
  ["POST", "/comments", createCommentHandler],
];

const handlers: Deno.ServeHandler = async (request) => {
  for (const [method, pathname, handler] of routes) {
    if (
      new URL(request.url).pathname === pathname &&
      [method, "OPTIONS"].includes(request.method)
    ) {
      const result = await handler(request);
      return new Response(render(result), {
        headers: {
          "content-type": "text/html; charset=utf-8",
        },
      });
    }
  }
  return new Response(null, { status: STATUS_CODE.NotFound });
};

export default handlers;
