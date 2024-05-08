import type { HtmxServeHandler } from "deno-htmx/mod.ts";
import { Home } from "@/components/mod.tsx";

export const homeHandler: HtmxServeHandler = () => ({
  body: Home(),
});
