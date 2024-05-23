import { nanoid } from "https://deno.land/x/nanoid@v3.0.0/mod.ts";
import { DB } from "sqlite/mod.ts";
import type { FullComment, SlimComment } from "@/models/mod.ts";

const db = new DB(Deno.env.get("COMMENTS_DATABASE") ?? "comments.db");

type CommentRow = [string, string, string, number, string | null, string];

db.execute(`
  create table if not exists comments (
    id text primary key,
    hostname text not null,
    pathname text not null,
    created_at integer default (unixepoch()) not null,
    author_name text,
    body text not null
  );
`);

db.execute(`
  create index if not exists idx_comments_get
  on comments (
    hostname,
    pathname,
    created_at desc
  );
`);

export const getComments = (hostname: string, pathname: string) => {
  const comments = db.queryEntries<SlimComment>(
    "select author_name, created_at, body from comments where hostname = ? and pathname = ? order by created_at desc limit 10",
    [hostname, pathname],
  );
  return comments;
};

type CreateCommentQueryParams = Omit<FullComment, "created_at">;
const createCommentQuery = db.prepareQuery<
  CommentRow,
  FullComment,
  CreateCommentQueryParams
>(`
  insert into comments
    (id, hostname, pathname, body, author_name)
    values
    (:id, :hostname, :pathname, :body, :author_name)
    returning *
`);

export const createComment = (
  hostname: string,
  pathname: string,
  body: string,
  author_name: string | null,
): FullComment => {
  const id = nanoid();
  const comment = createCommentQuery.firstEntry({
    id,
    hostname,
    pathname,
    body,
    author_name,
  });
  if (!comment) {
    throw new Error("Comment creation failed somehow");
  }
  return comment;
};
