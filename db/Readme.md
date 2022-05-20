## Dev Database

- Docker and docker compose is required
- copy `.env.example` to `.env`. Fill out DB credentials in `.env`

To start mysql db and phpmyadmin, run 
`docker compose up -d` (note, some OS require `docker-compose` instead)

To kill it, type `docker compose stop`

To also remove the container `docker-compose down`