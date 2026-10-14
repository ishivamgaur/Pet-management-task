# Pet Adoption Management System

Full-stack MERN app. Visitors browse pets with search, filter and pagination. Users apply for adoption. Admins manage pets and applications.

## Stack

- Backend: Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, multer
- Frontend: React (Vite) + Axios + React Router, plain CSS

## Folder structure

```
backend/src/
  config/db.js        - mongo connect
  middleware/auth.js  - login check + admin check
  models/             - User, Pet, Application
  routes/             - auth, pets, applications
  utils/makeToken.js  - jwt helper
  app.js              - express app
  server.js           - start + seed admin
frontend/src/
  api/client.js       - axios instance + token header
  api/index.js        - every backend call (authApi, petsApi, appsApi)
  context/AuthContext.jsx - logged in user for the whole app
  components/         - Navbar, PetCard, Protected, Select, Magnetic
  pages/              - Home, PetDetails, Login, Register, Dashboard, Admin
```

State: React Context holds the logged in user, each page holds its
own data with `useState`. No store library: the app is too small to
need one, and every server call goes through `src/api` so endpoints
change in exactly one file.

## Run locally

Backend:

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Frontend:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Seeded admin: `admin@shelter.com / admin123`

## API docs

See `backend/README.md` for endpoint table. Import `backend/postman_collection.json` into Postman.
