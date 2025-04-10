import type { RouterTypes } from "bun";
import type { HtmxResponse, HtmxServeHandler } from "./types.ts";

export function htmxResponseToStandard<Body>(
  stringifyBody: (body: Body) => string,
): (response: HtmxResponse<Body>) => Response {
  return function (response) {
    const body = response.body && stringifyBody(response.body);
    const headers = new Headers(response.init?.headers);
    headers.set("content-type", "text/html; charset=utf-8");
    if (response.options?.reswap) {
      headers.set("HX-Reswap", response.options.reswap);
    }
    if (response.options?.retarget) {
      headers.set("HX-Retarget", response.options.retarget);
    }
    return new Response(body, { ...response.init, headers });
  };
}

export function htmxServe<Body>(stringifyBody: (body: Body) => string) {
  return function (
    handler: HtmxServeHandler<Body>,
  ): RouterTypes.RouteHandler<string> {
    return async function (request, server) {
      const response = await handler(request, server);
      return htmxResponseToStandard(stringifyBody)(response);
    };
  };
}
