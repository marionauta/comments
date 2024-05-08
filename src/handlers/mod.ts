import { STATUS_CODE } from "deno/http/status.ts";
import type { HtmxServeHandler } from "deno-htmx/mod.ts";
import { homeHandler } from "@/handlers/homeHandler.ts";
import { listCommentsHandler } from "@/handlers/listCommentsHandler.ts";
import { createCommentHandler } from "@/handlers/createCommentHandler.ts";

const routes: [string, string, HtmxServeHandler][] = [
  ["GET", "/", homeHandler],
  ["GET", "/comments", listCommentsHandler],
  ["POST", "/comments", createCommentHandler],
];

const handlers: HtmxServeHandler = async (request, info) => {
  for (const [method, pathname, handler] of routes) {
    if (
      new URL(request.url).pathname === pathname &&
      [method, "OPTIONS"].includes(request.method)
    ) {
      return await handler(request, info);
    }
  }
  return { body: null, init: { status: STATUS_CODE.NotFound } };
};

export default handlers;
