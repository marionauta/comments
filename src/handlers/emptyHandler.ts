import type { HtmxServeHandler } from "@/htmx/preact/types.ts";

export const emptyHandler: HtmxServeHandler = () => ({ body: null });
