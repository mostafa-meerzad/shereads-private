// hooks/useToggleFavorite.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/apiClient";
import { queryKeys } from "../lib/queryKeys";

async function addFavoriteApi({ userId, bookId }) {
  const { data } = await api.post("/favorites", { userId, bookId });
  return data;
}
async function removeFavoriteApi({ userId, bookId }) {
  const { data } = await api.delete("/favorites", { data: { userId, bookId } });
  return data;
}

export function useToggleFavorite(userId) {
  const qc = useQueryClient();

  const add = useMutation(addFavoriteApi, {
    onMutate: async (vars) => {
      const key = queryKeys.favorites.byUser(userId);
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData(key);
      if (previous) {
        qc.setQueryData(key, (old) => ({
          favorites: [...(old.favorites || []), { id: vars.bookId }],
        }));
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      const key = queryKeys.favorites.byUser(userId);
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.favorites.byUser(userId) });
    },
  });

  const remove = useMutation(removeFavoriteApi, {
    onMutate: async (vars) => {
      const key = queryKeys.favorites.byUser(userId);
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData(key);
      if (previous) {
        qc.setQueryData(key, (old) => ({
          favorites: (old.favorites || []).filter((b) => b.id !== vars.bookId),
        }));
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      const key = queryKeys.favorites.byUser(userId);
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.favorites.byUser(userId) });
    },
  });

  return { add, remove };
}
