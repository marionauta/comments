import * as logger from "deno/log/mod.ts";
import handlers from "@/handlers/mod.ts";
import middlewares from "@/middlewares/mod.ts";
import { htmxServe } from "deno-htmx/mod.ts";

if (import.meta.main) {
  const onListen: Deno.ServeOptions["onListen"] = ({ hostname, port }) => {
    logger.info(`Listening on http://${hostname}:${port}/`);
  };

  const port = parseInt(Deno.env.get("PORT") || "8080", 10);
  Deno.serve({ port, onListen }, htmxServe(middlewares(handlers)));
}
