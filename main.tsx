import { DB } from "sqlite/mod.ts";
import { nanoid } from "https://deno.land/x/nanoid@v3.0.0/mod.ts";
import { JSX } from "https://esm.sh/preact@10.20.2";
import { render } from "https://esm.sh/preact-render-to-string@6.4.2";
import { STATUS_CODE } from "deno/http/status.ts";
import * as logger from "deno/log/mod.ts";
import { TelegramBot } from "telegram/mod.ts";

// db

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

// telegram

const tgId = Deno.env.get("TELEGRAM_CHAT_ID");
const tgToken = Deno.env.get("TELEGRAM_BOT_TOKEN");

let tgBot: TelegramBot | undefined;
if (typeof tgToken === "string") {
  tgBot = new TelegramBot(tgToken);
} else {
  logger.warn("Missing `TELEGRAM_BOT_TOKEN`");
}

const sendTelegramMessage = (message: string) => {
  if (!tgBot) return;
  if (!tgId) {
    logger.warn("Missing `TELEGRAM_CHAT_ID`");
    return;
  }
  tgBot.sendMessage({
    chat_id: tgId,
    text: message,
  });
};

// types

type CommHandler = (
  request: Request,
) => JSX.Element | Promise<JSX.Element>;

type Comment = {
  author_name?: string;
  created_at: number;
  body: string;
};

// utils

const getServerHost = (request: Request): string => {
  const https = request.headers.get("origin")?.includes("https") ?? true;
  const base = request.headers.get("host") ?? "comments.nachbaur.dev";
  return `${https ? "https" : "http"}://${base}`;
};

const getHostAndPathname = (request: Request): [string, string] => {
  const currentUrl = request.headers.get("hx-current-url");
  if (typeof currentUrl !== "string") {
    throw new Response(null);
  }
  const parsed = new URL(currentUrl);
  return [parsed.hostname, parsed.pathname];
};

// components

type SingleCommentProps = {
  comment: Comment;
};

const SingleComment = ({ comment }: SingleCommentProps) => (
  <div class="comment">
    <span class="comment--author-name">{comment.author_name || "Anónimo"}</span>
    <span class="comment--created-at">
      {new Date(comment.created_at * 1000).toLocaleDateString("es")}
    </span>
    <span class="comment--body">{comment.body}</span>
  </div>
);

const CommentForm = ({ serverHost }: { serverHost: string }) => (
  <form
    class="comments-form"
    hx-post={`${serverHost}/comments`}
    hx-swap="outerHTML"
  >
    <textarea name="comment" placeholder="Comentario..." required />
    <input type="text" placeholder="Nombre, opcional" name="author-name" />
    <button type="submit">Enviar</button>
  </form>
);

type CommentSectionProps = {
  comments: Comment[];
  serverHost: string;
};

const CommentSection = ({ comments, serverHost }: CommentSectionProps) => (
  <div id="comments">
    <h2>Comentarios</h2>
    <CommentForm serverHost={serverHost} />
    <div class="comments">
      {comments.map((comment) => <SingleComment comment={comment} />)}
      {!comments.length && (
        <div class="comment">
          <span class="comment--body">Aun no hay comentarios.</span>
        </div>
      )}
    </div>
  </div>
);

// handlers

const serveComments: CommHandler = (request) => {
  const serverHost = getServerHost(request);
  const [hostname, pathname] = getHostAndPathname(request);
  const comments = db.queryEntries<Comment>(
    "select author_name, created_at, body from comments where hostname = ? and pathname = ? order by created_at desc limit 10",
    [hostname, pathname],
  );
  return <CommentSection comments={comments} serverHost={serverHost} />;
};

const postComment: CommHandler = async (request) => {
  const serverHost = getServerHost(request);
  const [hostname, pathname] = getHostAndPathname(request);
  const data = await request.formData();
  const comment = data.get("comment");
  const author_name = data.get("author-name") ?? "";
  if (typeof comment === "string" && typeof author_name == "string") {
    const id = nanoid();
    db.query(
      "insert into comments (id, hostname, pathname, body, author_name) values (?, ?, ?, ?, ?)",
      [id, hostname, pathname, comment, author_name],
    );
    const update =
      `Comment by ${author_name}: ${comment} @ ${hostname}${pathname}`;
    logger.info(update);
    sendTelegramMessage(update);
  }
  return (
    <div
      class="comments-success"
      hx-get={`${serverHost}/comments`}
      hx-target="#comments"
      hx-swap="outerHTML"
      hx-trigger="load delay:2s"
    >
      Comentario enviado!
    </div>
  );
};

const routes: [string, string, CommHandler][] = [
  ["GET", "/comments", serveComments],
  ["POST", "/comments", postComment],
];

const handler: Deno.ServeHandler = async (request) => {
  for (const [method, pathname, handler] of routes) {
    if (
      new URL(request.url).pathname === pathname &&
      [method, "OPTIONS"].includes(request.method)
    ) {
      const result = await handler(request);
      return new Response(render(result));
    }
  }
  return new Response(null, { status: STATUS_CODE.NotFound });
};

// middlewares

type Middleware = (next: Deno.ServeHandler) => Deno.ServeHandler;

const catchAllErrors: Middleware = (next) => async (request, connInfo) => {
  try {
    return await next(request, connInfo);
  } catch (error) {
    logger.error(`${request.method} ${request.url}`);
    const message = error instanceof Error ? error.message : error;
    logger.error(message);
    const serverHost = getServerHost(request);
    const result = (
      <div id="comments">
        <h2>Comentarios</h2>
        <div class="comments-success" style="flex-direction: column">
          <span>Ocurrió un error</span>
          <button
            hx-get={`${serverHost}/comments`}
            hx-target="#comments"
            hx-swap="outerHTML"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
    return new Response(render(result), {
      status: STATUS_CODE.OK,
    });
  }
};

const corsHeaders: Middleware = (next) => async (request, info) => {
  const origins = ["http://localhost:1313", "https://letrasdesevillanas.com"];

  if (request.method == "OPTIONS") {
    const response = new Response(null, { status: STATUS_CODE.NoContent });
    response.headers.append("Access-Control-Allow-Origin", "*");
    response.headers.append("Access-Control-Allow-Methods", request.method);
    response.headers.append(
      "Access-Control-Allow-Headers",
      request.headers.get("Access-Control-Request-Headers") ?? "",
    );
    return response;
  }
  const response = await next(request, info);
  response.headers.append("Access-Control-Allow-Origin", "*");
  // response.headers.append("Access-Control-Allow-Origin", "https://letrasdesevillanas.com");
  // response.headers.append("vary", "origin");
  return response;
};

const compose = (...middlewares: Middleware[]): Middleware => (next) =>
  middlewares.reduceRight((acc, cur) => cur(acc), next);

const middlewares = compose(
  catchAllErrors,
  corsHeaders,
);

// main

if (import.meta.main) {
  const onListen: Deno.ServeOptions["onListen"] = ({ hostname, port }) =>
    logger.info(`Listening on http://${hostname}:${port}/`);

  const port = parseInt(Deno.env.get("PORT") || "8080", 10);
  Deno.serve({ port, onListen }, middlewares(handler));
}
