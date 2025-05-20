import logger from "@/logger.ts";
import { listCommentsHandler } from "@/handlers/listCommentsHandler.ts";
import { listHostCommentsHandler } from "./handlers/listHostCommentsHandler.ts";
import { createCommentHandler } from "@/handlers/createCommentHandler.ts";
import { emptyHandler } from "@/handlers/emptyHandler.ts";
import { htmxServe, type HtmxServeHandler } from "@/htmx/preact/index.ts";
import middlewares from "@/middlewares/mod.ts";
import type { RouterTypes } from "bun";

const server = Bun.serve({
  routes: {
    "/": new Response("Comments - Nothing to see here!"),
    "/comments": {
      OPTIONS: serve(emptyHandler),
      GET: serve(listCommentsHandler),
      POST: serve(createCommentHandler),
    },
    "/comments/host": serve(listHostCommentsHandler),
  },
});

function serve<T extends string>(
  handler: HtmxServeHandler,
): RouterTypes.RouteHandler<T> {
  return function (request, server) {
    return htmxServe(middlewares(handler))(request, server);
  };
}

logger.info(`Listening on ${server.url}`);
