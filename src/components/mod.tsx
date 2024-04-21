import { FunctionalComponent } from "preact";
import { type Comment } from "@/models/mod.ts";

export const MainCommentsFrame: FunctionalComponent = (
  { children, ...rest },
) => (
  <div id="comments" {...rest}>
    <h2>Comentarios</h2>
    {children}
  </div>
);

type ServerErrorResponseProps = {
  serverHost: string;
};

export const ServerErrorResponse = (
  { serverHost }: ServerErrorResponseProps,
) => (
  <MainCommentsFrame>
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
  </MainCommentsFrame>
);

type SingleCommentProps = {
  comment: Comment;
};

export const SingleComment = ({ comment }: SingleCommentProps) => (
  <div class="comment">
    <span class="comment--author-name">{comment.author_name || "Anónimo"}</span>
    <span class="comment--created-at">
      {new Date(comment.created_at * 1000).toLocaleDateString("es")}
    </span>
    <span class="comment--body">{comment.body}</span>
  </div>
);

export const CommentForm = ({ serverHost }: { serverHost: string }) => (
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

export const CommentSection = (
  { comments, serverHost }: CommentSectionProps,
) => (
  <MainCommentsFrame>
    <CommentForm serverHost={serverHost} />
    <div class="comments">
      {comments.map((comment) => <SingleComment comment={comment} />)}
      {!comments.length && (
        <div class="comment">
          <span class="comment--body">Aun no hay comentarios.</span>
        </div>
      )}
    </div>
  </MainCommentsFrame>
);

type CommentPublishedProps = {
  serverHost: string;
};

export const CommentPublished = ({ serverHost }: CommentPublishedProps) => (
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
