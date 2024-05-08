import { STATUS_CODE } from "deno/http/status.ts";
import { htmxResponseToStandard, HtmxServeHandler } from "deno-htmx/mod.ts";
import { homeHandler } from "@/handlers/homeHandler.ts";
import { listCommentsHandler } from "@/handlers/listCommentsHandler.ts";
import { createCommentHandler } from "@/handlers/createCommentHandler.ts";

const routes: [string, string, HtmxServeHandler][] = [
  ["GET", "/", homeHandler],
  ["GET", "/comments", listCommentsHandler],
  ["POST", "/comments", createCommentHandler],
];

const handlers: Deno.ServeHandler = async (request, info) => {
  for (const [method, pathname, handler] of routes) {
    if (
      new URL(request.url).pathname === pathname &&
      [method, "OPTIONS"].includes(request.method)
    ) {
      const response = await handler(request, info);
      return htmxResponseToStandard(response);
    }
  }
  return new Response(null, { status: STATUS_CODE.NotFound });
};

export default handlers;
