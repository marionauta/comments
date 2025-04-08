import { nanoid } from "nanoid";
import { Database } from "bun:sqlite";
import type { FullComment, SlimComment } from "@/models/mod.ts";

const db = new Database(import.meta.env["COMMENTS_DATABASE"] ?? "comments.db", {
  strict: true,
});

db.exec(`
  create table if not exists comments (
    id text primary key,
    hostname text not null,
    pathname text not null,
    created_at integer default (unixepoch()) not null,
    author_name text,
    body text not null
  );
`);

db.exec(`
  create index if not exists idx_comments_get
  on comments (
    hostname,
    pathname,
    created_at desc
  );
`);

type GetCommentsParams = {
  hostname: string;
  pathname: string;
};

const getCommentsQuery = db.query<SlimComment, GetCommentsParams>(`
  select
    author_name, created_at, body
  from
    comments
  where
    hostname = :hostname and pathname = :pathname
  order by
    created_at desc
  limit
    10;"
`);

export const getComments = (params: GetCommentsParams) => {
  const comments = getCommentsQuery.all(params);
  return comments;
};

type CreateCommentParams = Omit<FullComment, "created_at">;
const createCommentQuery = db.query<FullComment, CreateCommentParams>(`
  insert into
    comments (id, hostname, pathname, body, author_name)
  values
    (:id, :hostname, :pathname, :body, :author_name)
  returning *;
`);

export const createComment = (
  params: Omit<CreateCommentParams, "id">,
): FullComment => {
  const id = nanoid();
  const comment = createCommentQuery.get({
    ...params,
    id,
  });
  if (!comment) {
    throw new Error("Comment creation failed somehow");
  }
  return comment;
};
