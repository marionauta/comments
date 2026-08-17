FROM docker.io/oven/bun:alpine

WORKDIR /app
COPY . .

RUN bun install

RUN mkdir -p /data

ENV COMMENTS_DATABASE=/data/comments.db
ENV PORT=80
EXPOSE 80

CMD [ "bun", "serve" ]
