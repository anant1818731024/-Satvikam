import { useGetUserMe } from "@workspace/api-client-react";

export function useCurrentUser() {
  const { data, isLoading, refetch } = useGetUserMe();
  return {
    user: data?.authenticated ? data.user : undefined,
    isAuthenticated: data?.authenticated ?? false,
    isLoading,
    refetch,
  };
}
