comments:
	deno task build

.PHONY: run
run:
	deno task start

.PHONY: deploy
deploy: comments
	sh deploy.sh marioserver /var/www comments
