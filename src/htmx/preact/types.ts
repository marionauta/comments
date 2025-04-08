export type * from "../types.ts";
import type { JSX } from "preact";
import type {
  HtmxResponse as HtmxResponseBase,
  HtmxServeHandler as HtmxServeHandlerBase,
} from "../types.ts";

export type HtmxResponse = HtmxResponseBase<JSX.Element>;
export type HtmxServeHandler = HtmxServeHandlerBase<JSX.Element>;
