export type FullComment = {
  id: string;
  hostname: string;
  pathname: string;
  body: string;
  author_name: string | null;
  created_at: number;
};

export type SlimComment = Pick<
  FullComment,
  "author_name" | "created_at" | "body"
>;
