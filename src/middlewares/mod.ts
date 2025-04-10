import logger from "@/logger.ts";
import { getServerHost } from "@/helpers/mod.ts";
import { ServerErrorResponse } from "@/components/mod.tsx";
import type { HtmxResponse, HtmxServeHandler } from "@/htmx/preact/types.ts";

export type Middleware = (next: HtmxServeHandler) => HtmxServeHandler;

const catchAllErrors: Middleware = (next) => async (request, server) => {
  try {
    return await next(request, server);
  } catch (error) {
    logger.error(`${request.method} ${request.url}`);
    const message = error instanceof Error ? error.message : error;
    logger.error(message);
    const serverHost = getServerHost(request, server);
    return {
      body: ServerErrorResponse({ serverHost }),
    };
  }
};

const corsHeaders: Middleware =
  (next) =>
  async (request, server): Promise<HtmxResponse> => {
    const headers: Record<string, string> = {
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Origin": request.headers.get("origin") ?? "*",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Headers": "hx-current-url,hx-request,hx-target",
      "Access-Control-Expose-Headers": "hx-reswap,hx-retarget",
    };
    if (request.method == "OPTIONS") {
      return {
        body: null,
        init: {
          status: 204,
          headers,
        },
      };
    }
    const response = await next(request, server);
    return {
      ...response,
      init: {
        ...response.init,
        headers: {
          ...response.init?.headers,
          ...headers,
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
