# Init
1. Execute the docker compose for the database
```sh
cd infra
docker compose up -d
```

2. Execute prisma generate with 
```bash
bunx prisma generate
bunx prisma db push
```

3. Run the app
```bash
bunx prisma generate
```