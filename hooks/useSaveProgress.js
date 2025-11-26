import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export function useSaveProgress(userId) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, lastPage }) => {
      return axios.post(`/api/reading-progress/${userId}`, {
        bookId,
        lastPage,
      });
    },

    onSuccess: () => {
      qc.invalidateQueries(["reading-progress", userId]);
    },
  });
}

