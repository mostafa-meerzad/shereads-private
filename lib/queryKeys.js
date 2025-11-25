// lib/queryKeys.js
export const queryKeys = {
  books: {
    all: ["books"],
    lists: (filters = {}) => [...queryKeys.books.all, "list", JSON.stringify(filters)],
    details: (id) => [...queryKeys.books.all, "detail", id],
  },
  authors: {
    all: ["authors"],
    lists: (filters = {}) => [...queryKeys.authors.all, "list", JSON.stringify(filters)],
    details: (id) => [...queryKeys.authors.all, "detail", id],
  },
  favorites: {
    byUser: (userId) => ["favorites", "user", userId],
  },
  recommendations: {
    byUser: (userId) => ["recommendations", "user", userId],
  },
  auth: {
    currentUser: ["auth", "currentUser"],
  },
};
