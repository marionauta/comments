import { CommHandler } from "@/models/mod.ts";
import { Home } from "@/components/mod.tsx";

export const homeHandler: CommHandler = () => {
  return Home();
};
