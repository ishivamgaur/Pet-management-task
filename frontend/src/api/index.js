import client from "./client";

// Every backend call lives here. Pages import from "../api"
// and never touch axios directly, so endpoints change in one place.

export const authApi = {
  register(data) {
    return client.post("/auth/register", data);
  },
  login(data) {
    return client.post("/auth/login", data);
  },
  me() {
    return client.get("/auth/me");
  },
};

export const petsApi = {
  list(params) {
    return client.get("/pets", { params });
  },
  get(id) {
    return client.get(`/pets/${id}`);
  },
  create(data) {
    return client.post("/pets", data);
  },
  update(id, data) {
    return client.put(`/pets/${id}`, data);
  },
  remove(id) {
    return client.delete(`/pets/${id}`);
  },
};

export const appsApi = {
  apply(data) {
    return client.post("/applications", data);
  },
  mine() {
    return client.get("/applications/mine");
  },
  all(status) {
    return client.get("/applications", { params: status ? { status } : {} });
  },
  decide(id, status) {
    return client.put(`/applications/${id}`, { status });
  },
};
