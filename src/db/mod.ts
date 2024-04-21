import { nanoid } from "https://deno.land/x/nanoid@v3.0.0/mod.ts";
import { DB } from "sqlite/mod.ts";
import type { FullComment, SlimComment } from "@/models/mod.ts";

const db = new DB(Deno.env.get("COMMENTS_DATABASE") ?? "comments.db");

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

export const getComments = (hostname: string, pathname: string) => {
  const comments = db.queryEntries<SlimComment>(
    "select author_name, created_at, body from comments where hostname = ? and pathname = ? order by created_at desc limit 10",
    [hostname, pathname],
  );
  return comments;
};

export const createComment = (
  hostname: string,
  pathname: string,
  body: string,
  author_name: string,
): FullComment => {
  const id = nanoid();
  db.query(
    "insert into comments (id, hostname, pathname, body, author_name) values (?, ?, ?, ?, ?)",
    [id, hostname, pathname, body, author_name],
  );
  const results = db.queryEntries<FullComment>(
    "select * from comments where id = ?",
    [id],
  );
  return results[0];
};
