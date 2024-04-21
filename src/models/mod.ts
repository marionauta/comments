import { JSX } from "preact";

export type CommHandler = (
  request: Request,
) => JSX.Element | Promise<JSX.Element>;

export type Comment = {
  author_name?: string;
  created_at: number;
  body: string;
};
