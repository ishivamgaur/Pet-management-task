# Backend API

Base URL: `http://localhost:5000/api`

Auth: send `Authorization: Bearer <token>` for protected routes.

| Method | Route | Who | Body / Query |
|---|---|---|---|
| POST | /auth/register | public | { name, email, password } |
| POST | /auth/login | public | { email, password } |
| GET | /auth/me | user | None |
| GET | /pets?search=&species=&breed=&minAge=&maxAge=&status=&page=&limit= | public | query |
| GET | /pets/:id | public | None |
| POST | /pets | admin | { name, species, breed, age, gender, description, photoUrl, status } |
| PUT | /pets/:id | admin | any subset of the fields above |
| DELETE | /pets/:id | admin | None |
| POST | /applications | user | { petId, message, phone } |
| GET | /applications/mine | user | None |
| GET | /applications?status= | admin | query |
| PUT | /applications/:id | admin | { status: approved \| rejected } |
| GET | /health | public | None |
