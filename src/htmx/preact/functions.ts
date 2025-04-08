import { render } from "preact-render-to-string";
import {
  htmxResponseToStandard as htmxResponseToStandardBase,
  htmxServe as htmxServeBase,
} from "../functions.ts";

export const htmxResponseToStandard = htmxResponseToStandardBase(render);
export const htmxServe = htmxServeBase(render);
