import * as logger from "deno/log/mod.ts";
import { getServerHost } from "@/helpers/mod.ts";
import { STATUS_CODE } from "deno/http/status.ts";
import { render } from "https://esm.sh/preact-render-to-string@6.4.2";
import { ServerErrorResponse } from "@/components/mod.tsx";

export type Middleware = (next: Deno.ServeHandler) => Deno.ServeHandler;

const catchAllErrors: Middleware = (next) => async (request, connInfo) => {
  try {
    return await next(request, connInfo);
  } catch (error) {
    logger.error(`${request.method} ${request.url}`);
    const message = error instanceof Error ? error.message : error;
    logger.error(message);
    const serverHost = getServerHost(request);
    const result = ServerErrorResponse({ serverHost });
    return new Response(render(result), {
      status: STATUS_CODE.OK,
    });
  }
};

const corsHeaders: Middleware = (next) => async (request, info) => {
  if (request.method == "OPTIONS") {
    const response = new Response(null, { status: STATUS_CODE.NoContent });
    response.headers.append("Access-Control-Allow-Origin", "*");
    response.headers.append("Access-Control-Allow-Methods", request.method);
    response.headers.append(
      "Access-Control-Allow-Headers",
      request.headers.get("Access-Control-Request-Headers") ?? "",
    );
    return response;
  }
  const response = await next(request, info);
  response.headers.append("Access-Control-Allow-Origin", "*");
  // response.headers.append("Access-Control-Allow-Origin", "https://letrasdesevillanas.com");
  // response.headers.append("vary", "origin");
  return response;
};

const compose = (...middlewares: Middleware[]): Middleware => (next) =>
  middlewares.reduceRight((acc, cur) => cur(acc), next);

const middlewares = compose(
  catchAllErrors,
  corsHeaders,
);

export default middlewares;
