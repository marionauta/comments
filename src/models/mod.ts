import { JSX } from "preact";

export type CommHandler = (
  request: Request,
) => CommentResponse | Promise<CommentResponse>;

// there are more
export type RewsapOption = "innerHTML" | "outerHTML";

export type CommentResponseOptions = {
  rewsap?: RewsapOption;
};

export type CommentResponse = {
  body: JSX.Element;
  options?: CommentResponseOptions;
};

export type FullComment = {
  id: string;
  hostname: string;
  pathname: string;
  body: string;
  author_name?: string;
  created_at: number;
};

export type SlimComment = Pick<
  FullComment,
  "author_name" | "created_at" | "body"
>;
