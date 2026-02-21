# Backend setup

1. Copy `.env.example` to `.env` and fill environment-specific values.

2. Install dependencies and run migrations:

```powershell
cd backend
npm install
# ensure .env database settings are set
npx knex migrate:latest
node src/app.js
```

3. The server uses environment variables for DB and JWT settings. Example keys:

- DB_HOST
- DB_PORT
- DB_NAME
- DB_USER
- DB_PASSWORD
- DATABASE_URL (optional) - when set, knex will use it directly
- JWT_SECRET
- JWT_EXPIRES_IN
- EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS

Notes:
- `knexfile.js` reads `.env` from the backend root. Ensure to use developer credentials for local runs.
