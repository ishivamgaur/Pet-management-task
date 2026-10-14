import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, petsApi, appsApi } from "./index";

// Server data, not client state, so it belongs in a query cache keyed by
// request rather than in useState. Two components asking for the same thing
// now share one request instead of firing two.
export const keys = {
  pets: (params) => ["pets", params],
  pet: (id) => ["pet", id],
  stats: () => ["petStats"],
  myApps: () => ["myApps"],
  allApps: (status) => ["allApps", status || "all"],
};

export function usePets(params) {
  return useQuery({
    queryKey: keys.pets(params),
    queryFn: () => petsApi.list(params).then((r) => r.data),
    // Keeps the current page on screen while the next one loads, which is
    // what stops the skeleton flashing on every page change.
    placeholderData: (previous) => previous,
  });
}

export function usePet(id) {
  const qc = useQueryClient();

  return useQuery({
    queryKey: keys.pet(id),
    queryFn: () => petsApi.get(id).then((r) => r.data),
    enabled: Boolean(id),
    // Opening a pet from the listing should not refetch what we just
    // received, so seed from any cached list first.
    initialData: () =>
      qc
        .getQueriesData({ queryKey: ["pets"] })
        .flatMap(([, data]) => data?.pets || [])
        .find((p) => p._id === id),
    staleTime: 60_000,
  });
}

export function usePetStats() {
  return useQuery({
    queryKey: keys.stats(),
    queryFn: () => petsApi.stats().then((r) => r.data),
    // Aggregates only change when a pet is added or removed.
    staleTime: 60_000,
  });
}

export function useMyApplications() {
  return useQuery({
    queryKey: keys.myApps(),
    queryFn: () => appsApi.mine().then((r) => r.data),
  });
}

export function useAllApplications(status) {
  return useQuery({
    queryKey: keys.allApps(status),
    queryFn: () => appsApi.all(status).then((r) => r.data),
  });
}

// Every mutation lists the caches it invalidates, so approving a request
// refreshes pet statuses and totals without any page knowing another page
// depends on them.
function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["pets"] });
    qc.invalidateQueries({ queryKey: ["pet"] });
    qc.invalidateQueries({ queryKey: ["petStats"] });
    qc.invalidateQueries({ queryKey: ["myApps"] });
    qc.invalidateQueries({ queryKey: ["allApps"] });
  };
}

export function useApply() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (data) => appsApi.apply(data).then((r) => r.data),
    onSuccess: invalidate,
  });
}

export function useDecide() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, status }) => appsApi.decide(id, status).then((r) => r.data),
    onSuccess: invalidate,
  });
}

export function usePetMutations() {
  const invalidate = useInvalidate();
  return {
    create: useMutation({
      mutationFn: (data) => petsApi.create(data).then((r) => r.data),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, data }) => petsApi.update(id, data).then((r) => r.data),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id) => petsApi.remove(id).then((r) => r.data),
      onSuccess: invalidate,
    }),
  };
}

export { authApi };
