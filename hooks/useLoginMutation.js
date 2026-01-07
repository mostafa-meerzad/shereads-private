// hooks/useLoginMutation.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/apiClient";

export default function useLoginMutation({ onSuccessRedirect = "/home" } = {}) {
  const qc = useQueryClient();

  const mutation = useMutation(
    async (creds) => {
      const { data } = await api.post("/login", creds);
      // data = { user, token }
      return data;
    },
    {
      onSuccess: (data) => {
        // store into localStorage under auth-shereads for compat with useAuthClient
        try {
          localStorage.setItem("auth-shereads", JSON.stringify(data));
          // attach token to axios default header
          if (data.token) {
            api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
          }
          qc.setQueryData(["auth", "currentUser"], data.user);
          // optionally invalidate auth-related queries
          qc.invalidateQueries({ queryKey: ["favorites", "user", data.user.id] });
          qc.invalidateQueries({ queryKey: ["recommendations", "user", data.user.id] });
        } catch (e) {
          console.error(e);
        }
      },
    }
  );

  return mutation;
}
