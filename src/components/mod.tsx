import type { FunctionalComponent } from "preact";
import type { Comment } from "@/models/mod.ts";

export const MainCommentsFrame: FunctionalComponent = ({
  children,
  ...rest
}) => (
  <div id="comments" {...rest}>
    <h2>Comentarios</h2>
    {children}
  </div>
);

type ServerErrorResponseProps = {
  serverHost: string;
};

export const ServerErrorResponse = ({
  serverHost,
}: ServerErrorResponseProps) => (
  <div class="comments-failure">
    <span>Ocurrió un error</span>
    <button
      hx-get={`${serverHost}/comments`}
      hx-target="#comments"
      hx-swap="outerHTML"
    >
      Recargar
    </button>
  </div>
);

type SingleCommentProps = {
  comment: Comment;
};

export const SingleComment = ({ comment }: SingleCommentProps) => (
  <div class="comment">
    <span class="comment--author-name">{comment.author_name || "Anónimo"}</span>
    <a class="comment--created-at" href={`${comment.pathname}#comments`}>
      {new Date(comment.created_at * 1000).toLocaleDateString("es")}
    </a>
    <span class="comment--body">{comment.body}</span>
  </div>
);

type CommentFormProps = {
  serverHost: string;
  authorName: string | undefined;
};

export const CommentForm = ({ serverHost, authorName }: CommentFormProps) => (
  <form
    class="comments-form"
    hx-post={`${serverHost}/comments`}
    hx-swap="outerHTML"
  >
    <textarea name="comment" placeholder="Comentario..." required />
    <input
      type="text"
      placeholder="Nombre (opcional)"
      name="author-name"
      value={authorName}
    />
    <button type="submit">Enviar</button>
  </form>
);

type CommentSectionProps = {
  comments: Comment[];
  serverHost: string;
  authorName: string | undefined;
};

export const CommentSection = ({
  comments,
  serverHost,
  authorName,
}: CommentSectionProps) => (
  <MainCommentsFrame>
    <CommentForm serverHost={serverHost} authorName={authorName} />
    <div class="comments">
      {comments.map((comment) => (
        <SingleComment key={comment.id} comment={comment} />
      ))}
      {!comments.length && (
        <div class="comment">
          <span class="comment--body">Aun no hay comentarios.</span>
        </div>
      )}
    </div>
  </MainCommentsFrame>
);

type HostCommentSectionProps = {
  comments: Comment[];
};

export function HostCommentSection({ comments }: HostCommentSectionProps) {
  return comments.length > 0 ? (
    <div id="comments">
      <h2>Últimos comentarios</h2>
      {comments.map((comment) => (
        <SingleComment key={comment.id} comment={comment} />
      ))}
    </div>
  ) : null;
}

type CommentPublishedProps = {
  serverHost: string;
  authorName: string | null | undefined;
};

export const CommentPublished = ({
  serverHost,
  authorName,
}: CommentPublishedProps) => {
  const url = new URL(serverHost);
  url.pathname = "/comments";
  if (authorName) {
    url.searchParams.append("author_name", authorName);
  }
  return (
    <div
      class="comments-success"
      hx-get={url}
      hx-target="#comments"
      hx-swap="outerHTML"
      hx-trigger="load delay:2s"
    >
      Comentario enviado!
    </div>
  );
};
