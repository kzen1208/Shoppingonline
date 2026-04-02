# Shopping Online MERN Labs

This workspace rebuilds the shopping online project from the provided MERN lab PDFs.

## Structure

- `server`: Express API with admin and customer endpoints
- `client-admin`: React admin app on port `3001`
- `client-customer`: React customer app on port `3002`

## Notes

- MongoDB Atlas is optional here. The server runs immediately with local JSON seed data.
- A reasonable replacement for the missing `Lab_MERN_06.pdf` is included: customer sign-up, activate, and login.
- Seed accounts:
  - Admin: `admin` / `123`
  - Customer: `customer` / `123`

## Run

Open three terminals:

```bash
cd server
npm install
npm run dev
```

```bash
cd client-admin
npm install
npm start
```

```bash
cd client-customer
npm install
npm start
```

## URLs

- Server: `http://localhost:3000`
- Admin: `http://localhost:3001/admin`
- Customer: `http://localhost:3002`

## Replit Deployment

This repo is prepared to run on Replit with a single Express server.

If you import this repository into Replit, use the root folder and run:

```bash
npm start
```

The root `package.json` will:

- install dependencies for `client-admin`, `client-customer`, and `server`
- build both React apps
- start the Express server from `server`

After startup:

- `/admin` serves the built files from `client-admin/build`
- `/` serves the built files from `client-customer/build`
- `/api/*` continues to use the Express backend in `server`

If you want to run the steps manually instead:

```bash
cd client-admin
npm install
npm run build
```

```bash
cd client-customer
npm install
npm run build
```

```bash
cd server
npm install
npm start
```
