# PawHome

A shelter adoption platform. Visitors browse pets in need of a home, signed-in
adopters apply and track their requests, and shelter staff manage the animals
and decide who takes them home.

Built as a MERN task: React on the front, Express and MongoDB behind it, with
JWT auth and role-based authorization separating the three kinds of user.

## Features

**Visitor**

- Browse every pet with no account
- Search across name, breed, and species
- Filter by species, breed, age range, and adoption status
- Paginated results, so the list never grows unbounded
- Full detail page per pet

**Adopter**

- Register and log in, password hashed with bcrypt
- Apply to adopt any available pet, with an optional message and phone
- Track every application and its current status
- Cannot apply twice for the same pet, and cannot apply for an adopted one

**Shelter staff**

- Create, edit, and delete pets
- Review every application, approve or reject with one click
- Set a pet's status manually, or let the workflow do it automatically
- Bulk consequences handled server-side, see below

## The adoption workflow

The interesting part is what happens when staff approve an application. Doing
this only in the UI would let two people walk away thinking they own the same
cat, so the whole cascade lives in one place on the server:

1. The application becomes `approved`.
2. The pet flips to `adopted`, so it drops out of the available list.
3. Every other pending application for that pet is auto-rejected.
4. Rejecting the last pending applicant returns the pet to `available`.

All of it happens inside `PUT /api/applications/:id`.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 18, Vite, React Router, Axios |
| Styling | Tailwind CSS v4, Geist for display, Inter for body |
| Icons | Reicon |
| Toasts | Sonner |
| Backend | Node.js, Express 4 |
| Database | MongoDB with Mongoose |
| Auth | JWT + bcrypt |

No state library. The logged-in user lives in one React Context; every page
holds its own data with `useState`. The app is not big enough to justify a
store, and every server call is funnelled through `src/api` so a backend change
lands in exactly one file.

## Running it locally

Requires Node 18+ and a local MongoDB.

**Backend**

```bash
cd backend
cp .env.example .env
npm install
npm run seed    # optional: loads 27 demo pets
npm run dev
```

**Frontend**

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`, API on `http://localhost:5000`.

Seeded admin: `admin@shelter.com` / `admin123`

## Database

Works against a local MongoDB or MongoDB Atlas. Either way, put the database
name at the end of the URI:

```
mongodb://127.0.0.1:27017/pet_adoption
mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/pet_adoption
```

Without that trailing name the driver silently connects to a stray `test`
database instead, which is a confusing bug to chase later.

**Moving data between databases.** `npm run migrate` copies every user, pet,
and application from one MongoDB to another, preserving `_id` values so the
relationships between them survive. Target collections are emptied first, so
it is safe to re-run.

```bash
cd backend
SOURCE=mongodb://127.0.0.1:27017/pet_adoption \
TARGET="mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/pet_adoption" \
npm run migrate
```

**If Atlas will not connect locally**, the error is almost always
`querySrv ECONNREFUSED`. That is not Atlas, it is your network resolver
refusing the SRV lookup that `mongodb+srv` depends on. Set `DNS_SERVERS` in
`backend/.env` and it goes away:

```
DNS_SERVERS=8.8.8.8,1.1.1.1
```

Leave it unset when deploying, hosted resolvers handle Atlas fine.

## Environment variables

`backend/.env`

| Variable | Purpose |
|---|---|
| `PORT` | API port, defaults to 5000 |
| `MONGO_URI` | MongoDB connection string, include the database name |
| `JWT_SECRET` | signing key, must be changed outside local dev |
| `JWT_EXPIRES_IN` | token lifetime, defaults to 7d |
| `DNS_SERVERS` | optional, comma separated, local SRV workaround |
| `ADMIN_EMAIL` | account created on boot if absent |
| `ADMIN_PASSWORD` | password for that account |

`frontend/.env`

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | base URL for all API calls |

## Project layout

```
backend/src/
  app.js                 express app, middleware, route mounting
  server.js              boot, connects DB, ensures admin exists
  seed.js                fetches demo pets from public APIs
  config/db.js           mongoose connection
  config/dns.js          optional resolver override for Atlas
  middleware/auth.js     needLogin and needAdmin guards
  models/                User, Pet, Application schemas
  routes/                auth, pets, applications
  utils/                 JWT signing, regex escaping
  scripts/migrate.js     copy data between databases

frontend/src/
  api/client.js          axios instance, attaches the JWT
  api/index.js           every backend call in one place
  context/AuthContext    current user, login and logout
  lib/ui.js              shared button and status-tone helpers
  components/            Navbar, PetCard, PetRow, StatusBadge, FormField,
                         Select, FilterMenu, Protected, ScrollToTop,
                         ErrorBoundary, Magnetic
  pages/Home.jsx         public listing, search, filters, bottom sheet
  pages/PetDetails.jsx   single pet plus the application form
  pages/Dashboard.jsx    an adopter's own applications
  pages/admin/           AdminLayout, PetsAdmin, ApplicationsAdmin
  utils/                 motion presets, formatting, token storage
```

The admin area is split across two routes on purpose. Pet management and
application review are different jobs with different mental models, and
cramming both into one page made both worse.

## API

Base URL `http://localhost:5000/api`. Protected routes need
`Authorization: Bearer <token>`.

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | public | create an account |
| POST | `/auth/login` | public | returns a token |
| GET | `/auth/me` | any user | current profile |
| GET | `/pets` | public | list with search, filters, pagination |
| GET | `/pets/:id` | public | one pet |
| POST | `/pets` | admin | create |
| PUT | `/pets/:id` | admin | partial update |
| DELETE | `/pets/:id` | admin | remove |
| POST | `/applications` | user | apply to adopt |
| GET | `/applications/mine` | user | own applications |
| GET | `/applications` | admin | all applications |
| PUT | `/applications/:id` | admin | approve or reject |
| GET | `/health` | public | liveness check |

Query params for `GET /pets`: `search`, `species`, `breed`, `minAge`,
`maxAge`, `status`, `page`, `limit`. Responses are shaped
`{ pets, page, pages, total }`.

A full Postman collection is in `backend/postman_collection.json`.

## Validation and safety

- Passwords hashed with bcrypt, never returned by any endpoint
- Role checks on the server, so hiding a button is never the only defence
- Mongoose schema constraints: required fields, `min` on age, `enum` on gender
  and status
- Duplicate and impossible applications rejected with a readable message
- Search terms are regex-escaped, so a query cannot inject a pattern or hang
  the server on a nested quantifier

## Notes

Pet photos are referenced by URL, which is what the brief allows and what
keeps the project free of file storage and upload handling. The seed script
pulls real photos from public dog and cat APIs.