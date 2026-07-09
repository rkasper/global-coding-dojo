FROM denoland/deno:2.7.4
WORKDIR /app
COPY . .
RUN deno install
RUN deno test --allow-read --allow-net --allow-env
EXPOSE 8000
CMD ["deno", "run", "--allow-net", "--allow-read=./static", "--allow-env=PORT", "server.ts"]
