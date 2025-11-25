// hooks/useAddFavorite.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/apiClient";
import { queryKeys } from "../lib/queryKeys";

async function addFavorite({ userId, bookId }) {
  const { data } = await api.post(`/favorites/${userId}`, { bookId });
  return data;
}

async function removeFavorite({ userId, bookId }) {
  const { data } = await api.delete(`/favorites/${userId}`, {
    data: { bookId },
  });
  return data;
}

export function useToggleFavorite(userId) {
  const queryClient = useQueryClient();

 const add = useMutation({
  mutationFn: addFavorite,
  onMutate: async (vars) => {
    const key = queryKeys.favorites.byUser(userId);
    await queryClient.cancelQueries({ queryKey: key });

    const previous = queryClient.getQueryData(key);

    if (previous) {
      queryClient.setQueryData(key, (old) => ({
        favorites: [...(old.favorites || []), { id: vars.bookId }],
      }));
    }

    return { previous };
  },
  onError: (err, vars, context) => {
    const key = queryKeys.favorites.byUser(userId);
    if (context?.previous) {
      queryClient.setQueryData(key, context.previous);
    }
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.favorites.byUser(userId) });
  },
});


const remove = useMutation({
  mutationFn: removeFavorite,
  onMutate: async (vars) => {
    const key = queryKeys.favorites.byUser(userId);
    await queryClient.cancelQueries({ queryKey: key });

    const previous = queryClient.getQueryData(key);

    if (previous) {
      queryClient.setQueryData(key, (old) => ({
        favorites: (old.favorites || []).filter((b) => b.id !== vars.bookId),
      }));
    }

    return { previous };
  },
  onError: (err, vars, context) => {
    const key = queryKeys.favorites.byUser(userId);
    if (context?.previous) {
      queryClient.setQueryData(key, context.previous);
    }
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.favorites.byUser(userId) });
  },
});

  return { add, remove };
}
