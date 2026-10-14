# PawHome

A pet adoption management system built as a MERN task. Visitors browse the pets
looking for homes, adopters apply and track where their application stands, and
shelter staff manage the animals and decide who takes them home.

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square" alt="React">
  <img src="https://img.shields.io/badge/Node.js-43853D?style=flat-square" alt="Node">
  <img src="https://img.shields.io/badge/Express-000000?style=flat-square" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat-square" alt="MongoDB">
  <img src="https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square" alt="Tailwind">
</p>

---

## Roles

There are three kinds of user, and the app treats them differently at the route
level, not just in the UI.

| Role | What they can do |
|---|---|
| **Visitor** | Browse, search, filter, paginate pets and view any pet's details |
| **User** | Everything a visitor can, plus register, apply to adopt, and see their own applications |
| **Admin** | Full CRUD on pets, plus reviewing and deciding on every application |

Admins can't reach the user dashboard and users can't reach the admin desk.
Those checks live in middleware on the server, so hiding a button is never the
only thing standing between a user and someone else's data.

## Features

### Visitor

- List of every pet, no account needed
- Search by name, breed, or species
- Filter by species, breed, age range, and adoption status
- Pagination, nine pets to a page
- Detail page per pet with photo, age, breed, and description

### User

- Register and log in, passwords hashed with bcrypt
- Apply to adopt any available pet, with an optional message and phone number
- Dashboard listing every application they have made and its current status
- Blocked from applying twice for the same pet, or for one already adopted

### Admin

- Add, edit, and delete pets
- See every application from every user
- Approve or reject with one click
- Change a pet's status by hand, or let the workflow set it automatically

## The adoption workflow

The part worth looking at is what happens on approval. If this lived only in the
frontend, two people could both walk away thinking they own the same cat, so the
whole cascade runs on the server inside `PUT /api/applications/:id`:

1. The application is marked `approved`.
2. The pet is marked `adopted` and disappears from the available list.
3. Every other pending application for that pet is auto-rejected.
4. Rejecting the last pending applicant puts the pet back to `available`.

Verified end to end with two users applying for the same pet:

```
after 2 applies -> pet status = pending
after approve   -> pet status = adopted
all apps        -> Rival One:approved | Rival Two:rejected
```

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 18, Vite, React Router, Axios |
| Styling | Tailwind CSS v4, Geist for headings, Inter for body |
| Icons | Reicon |
| Toasts | Sonner |
| Backend | Node.js, Express 4 |
| Database | MongoDB with Mongoose, running on Atlas |
| Auth | JWT + bcrypt, role-based middleware |

I did not pull in Redux or any other store. The logged in user lives in one
React Context and each page keeps its own data with `useState`, which is plenty
at this size. Every API call goes through `src/api/index.js`, so if an endpoint
changes it changes in exactly one place.

## Running it locally

Needs Node 18+ and a MongoDB, either local or Atlas.

**Backend**

```bash
cd backend
cp .env.example .env
npm install
npm run seed    # optional, loads 27 demo pets
npm run dev
```

**Frontend**

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend on `http://localhost:5173`, API on `http://localhost:5000`.

Seeded admin is `admin@shelter.com` / `admin123`.

## Database

Works against a local MongoDB or Atlas. Put the database name at the end of the
URI either way:

```
mongodb://127.0.0.1:27017/pet_adoption
mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/pet_adoption
```

If you leave the name off, the driver quietly connects to a database called
`test` instead. I hit that myself while setting this up.

### Moving data between databases

`npm run migrate` copies all users, pets, and applications from one MongoDB to
another. It keeps the original `_id` values so the links between them survive,
and rebuilds the indexes on the way in. Safe to run twice.

```bash
cd backend
SOURCE=mongodb://127.0.0.1:27017/pet_adoption \
TARGET="mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/pet_adoption" \
npm run migrate
```

### If Atlas will not connect locally

You will get `querySrv ECONNREFUSED`. That is not Atlas rejecting you, it is
your network resolver refusing the SRV lookup that `mongodb+srv` relies on.
Some Windows setups do this. Put this in `backend/.env` and it goes away:

```
DNS_SERVERS=8.8.8.8,1.1.1.1
```

Leave it out when you deploy, hosted environments resolve Atlas fine.

## Environment variables

**`backend/.env`**

| Variable | What it does |
|---|---|
| `PORT` | API port, defaults to 5000 |
| `MONGO_URI` | MongoDB connection string, keep the database name on the end |
| `JWT_SECRET` | token signing key, change this before deploying |
| `JWT_EXPIRES_IN` | how long a token lasts, defaults to 7d |
| `DNS_SERVERS` | optional, only for the SRV problem described above |
| `ADMIN_EMAIL` | admin account created on boot if missing |
| `ADMIN_PASSWORD` | password for that account |

**`frontend/.env`**

| Variable | What it does |
|---|---|
| `VITE_API_URL` | base URL every API call goes to |

## Project layout

```
backend/src/
  app.js                 express app, middleware, route mounting
  server.js              boot, connects the DB, makes sure admin exists
  seed.js                pulls demo pets from public APIs
  config/db.js           mongoose connection
  config/dns.js          optional DNS override for Atlas
  middleware/auth.js     needLogin and needAdmin guards
  models/                User, Pet, Application schemas
  routes/                auth, pets, applications
  utils/                 JWT signing, regex escaping
  scripts/migrate.js     copy data between databases

frontend/src/
  api/client.js          axios instance, attaches the JWT
  api/index.js           every backend call in one place
  context/AuthContext    current user, login, logout
  lib/ui.js              shared button styles and status colours
  components/            Navbar, PetCard, PetRow, StatusBadge, FormField,
                         Select, FilterMenu, Protected, ScrollToTop,
                         ErrorBoundary, Magnetic
  pages/Home.jsx         public listing, search, filters, mobile sheet
  pages/PetDetails.jsx   one pet plus the application form
  pages/Dashboard.jsx    the signed in user's applications
  pages/admin/           AdminLayout, PetsAdmin, ApplicationsAdmin
  utils/                 motion presets, formatting, token storage
```

Admin is split into `/admin` for pets and `/admin/applications` for requests on
purpose. Managing animals and reviewing people are different jobs, and cramming
them onto one page made both of them worse.

## API

Base URL is `http://localhost:5000/api`. Protected routes want
`Authorization: Bearer <token>`.

| Method | Route | Who can | Does |
|---|---|---|---|
| POST | `/auth/register` | anyone | create an account |
| POST | `/auth/login` | anyone | returns a token |
| GET | `/auth/me` | any user | current profile |
| GET | `/pets` | anyone | list with search, filters, pagination |
| GET | `/pets/:id` | anyone | one pet |
| POST | `/pets` | admin | create a pet |
| PUT | `/pets/:id` | admin | update a pet |
| DELETE | `/pets/:id` | admin | remove a pet |
| POST | `/applications` | user | apply to adopt |
| GET | `/applications/mine` | user | own applications |
| GET | `/applications` | admin | all applications |
| PUT | `/applications/:id` | admin | approve or reject |
| GET | `/health` | anyone | liveness check |

`GET /pets` takes `search`, `species`, `breed`, `minAge`, `maxAge`, `status`,
`page`, and `limit`, and replies with `{ pets, page, pages, total }`.

There is a ready made Postman collection at `backend/postman_collection.json`.

## Validation

- Passwords are bcrypt hashed and never come back out of any endpoint
- Roles are enforced in server middleware, not just by hiding buttons
- Mongoose schemas enforce required fields, a minimum age, and enums for gender
  and status
- Duplicate and impossible applications get rejected with a message that says why
- Search text gets regex escaped, so nobody can crash the server with a stray
  bracket or hang it with a nasty pattern

## What the brief asked for

| Item | Where |
|---|---|
| Public listing with search, filters, pagination | `pages/Home.jsx` |
| User dashboard | `pages/Dashboard.jsx` |
| Admin dashboard | `pages/admin/` |
| JWT with role-based auth | `middleware/auth.js` |
| Pet photos | by URL, which the brief allows as an alternative to upload |
| Notifications | Sonner toasts on login, signup, and every admin action |
| `.env.example` | `backend/` and `frontend/` |
| API docs | `backend/postman_collection.json`, table above |
| Responsive UI | mobile filter sheet, floating navbar, layouts that reflow on small screens |

## Notes and things I left out

Pet photos are referenced by URL rather than uploaded. The brief allows either,
and URLs keep file storage out of the project entirely.

Notifications are toasts, but only on the actions that happen right in front of
you: logging in, signing up, and every admin change. An applicant who has been
approved does not get a push or an email. They find out by opening their
dashboard, where the status is shown on the application itself. Doing it
properly would mean a notification table and a poll or socket, which felt like
more than this project needed.

I did not deploy this. It runs locally against Atlas, which I verified end to
end, but there is no live link yet.