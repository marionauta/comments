import logger from "@/logger.ts";
import { getServerHost } from "@/helpers/mod.ts";
import { ServerErrorResponse } from "@/components/mod.tsx";
import type { HtmxResponse, HtmxServeHandler } from "@/htmx/preact/types.ts";

export type Middleware = (next: HtmxServeHandler) => HtmxServeHandler;

const catchAllErrors: Middleware = (next) => async (request) => {
  try {
    return await next(request);
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
  (next) =>
  async (request): Promise<HtmxResponse> => {
    if (request.method == "OPTIONS") {
      return {
        body: null,
        init: {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": request.method,
            "Access-Control-Allow-Headers":
              request.headers.get("Access-Control-Request-Headers") ?? "",
          },
        },
      };
    }
    const response = await next(request);
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

const compose =
  (...middlewares: Middleware[]): Middleware =>
  (next) =>
    middlewares.reduceRight((acc, cur) => cur(acc), next);

const middlewares = compose(catchAllErrors, corsHeaders);

export default middlewares;
