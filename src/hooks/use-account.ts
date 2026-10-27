import {
  useMutation,
  useQuery,
  useQueryClient,
  QueryClient,
} from "@tanstack/react-query";
import type { Account } from "@/lib/account/queries";
import type { ProfileInput } from "@/lib/account";

export const ACCOUNT_KEY = ["account"] as const;

async function request<T = unknown>(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(body?.message ?? "Request failed");
  }

  return body as { message: string; data: T };
}

const onSuccess = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ACCOUNT_KEY });
  queryClient.invalidateQueries({ queryKey: ["user"] });
};

const patch = (body: unknown): RequestInit => ({
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export function useAccountQuery() {
  return useQuery({
    queryKey: ACCOUNT_KEY,
    retry: false,
    queryFn: () => request<Account>("/api/account"),
    select: (res) => res.data,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ProfileInput) =>
      request<ProfileInput>("/api/account", patch(input)),
    // Returning the promise keeps the mutation pending until the refetch is done
    onSuccess: () => onSuccess(queryClient),
  });
}

export function useChangeEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) =>
      request("/api/account/email", patch({ email })),
    onSuccess: () => onSuccess(queryClient),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) =>
      request("/api/account/password", patch(input)),
  });
}
