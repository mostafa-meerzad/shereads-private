import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useReadingProgress(userId) {
  return useQuery({
    queryKey: ["reading-progress", userId],
    queryFn: async () => {
      const res = await axios.get(`/api/reading-progress/${userId}`);
      return res.data.progress;
    },

    staleTime: 0, // always get fresh
  });
}
