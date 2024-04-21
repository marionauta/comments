import { DB } from "sqlite/mod.ts";

export const db = new DB(Deno.env.get("COMMENTS_DATABASE") ?? "comments.db");

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
