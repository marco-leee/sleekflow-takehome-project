init:
	docker compose up -d
	cd app && bun install

db:
	docker compose exec -it -e PGPASSWORD=postgres postgres psql -U postgres -h localhost -p 5432 -d sleekflow