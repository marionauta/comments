import { DB } from "sqlite/mod.ts";
import { JSX } from "https://esm.sh/preact@10.20.2";
import { render } from "https://esm.sh/preact-render-to-string@6.4.2";
import { STATUS_CODE } from "deno/http/status.ts";
import * as logger from "deno/log/mod.ts";
import { TelegramBot } from "telegram/mod.ts";

const db = new DB(Deno.env.get("COMMENTS_DATABASE") ?? "comments.db");
db.execute(`
  create table if not exists comments (
    id integer primary key autoincrement,
    hostname text not null,
    pathname text not null,
    created_at integer default (unixepoch()) not null,
    author_name text,
    body text not null
  )
`);

const tgId = Deno.env.get("TELEGRAM_CHAT_ID") ?? "";
const bot = new TelegramBot(Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "");

export type CommHandler = (
  request: Request,
) => JSX.Element | Promise<JSX.Element>;

type Comment = {
  author_name?: string;
  created_at: number;
  body: string;
};

const Comment = ({ comment }: { comment: Comment }) => (
  <div class="comment">
    <span class="comment--author-name">{comment.author_name || "Anónimo"}</span>
    <span class="comment--created-at">
      {new Date(comment.created_at * 1000).toLocaleDateString("es")}
    </span>
    <span class="comment--body">{comment.body}</span>
  </div>
);

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
      {comments.map((comment) => <Comment comment={comment} />)}
      {!comments.length && (
        <div class="comment">
          <span class="comment--body">Aun no hay comentarios.</span>
        </div>
      )}
    </div>
  </div>
);

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
    db.query(
      "insert into comments (hostname, pathname, body, author_name) values (?, ?, ?, ?)",
      [hostname, pathname, comment, author_name],
    );
    const update = `Comment by '${author_name}': '${comment}' @ ${hostname}`;
    logger.info(update);
    bot.sendMessage({
      chat_id: tgId,
      text: update,
    });
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

type Middleware = (next: Deno.ServeHandler) => Deno.ServeHandler;

const middleware: Middleware =
  (next: Deno.ServeHandler) => async (request, info) => {
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

if (import.meta.main) {
  const onListen: Deno.ServeOptions["onListen"] = ({ hostname, port }) =>
    logger.info(`Listening on http://${hostname}:${port}/`);

  const port = parseInt(Deno.env.get("PORT") || "8080", 10);
  Deno.serve({ port, onListen }, middleware(handler));
}
