import * as logger from "deno/log/mod.ts";
import { getServerHost } from "@/helpers/mod.ts";
import { STATUS_CODE } from "deno/http/status.ts";
import { ServerErrorResponse } from "@/components/mod.tsx";
import type { HtmxResponse, HtmxServeHandler } from "deno-htmx/mod.ts";

export type Middleware = (next: HtmxServeHandler) => HtmxServeHandler;

const catchAllErrors: Middleware = (next) => async (request, connInfo) => {
  try {
    return await next(request, connInfo);
  } catch (error) {
    logger.error(`${request.method} ${request.url}`);
    const message = error instanceof Error ? error.message : error;
    logger.error(message);
    const serverHost = getServerHost(request);
    return {
      body: ServerErrorResponse({ serverHost }),
    };
  }
};

const corsHeaders: Middleware =
  (next) => async (request, info): Promise<HtmxResponse> => {
    if (request.method == "OPTIONS") {
      return {
        body: null,
        init: {
          status: STATUS_CODE.NoContent,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": request.method,
            "Access-Control-Allow-Headers":
              request.headers.get("Access-Control-Request-Headers") ?? "",
          },
        },
      };
    }
    const response = await next(request, info);
    return {
      ...response,
      init: {
        ...response.init,
        headers: {
          ...response.init?.headers,
          "Access-Control-Allow-Origin": "*",
        },
      },
    };
  };

const compose = (...middlewares: Middleware[]): Middleware => (next) =>
  middlewares.reduceRight((acc, cur) => cur(acc), next);

const middlewares = compose(
  catchAllErrors,
  corsHeaders,
);

export default middlewares;
