// recommendation logic
export function scoreBook(book, userPrefs) {
  let score = 0;

  // Parse JSON array fields
  const bookMoods = Array.isArray(book.mood) ? book.mood : [];
  const bookMotivations = Array.isArray(book.Motivation) ? book.Motivation : [];

  const userMoods = userPrefs.mood ? [userPrefs.mood] : [];
  const userMotivations = userPrefs.Motivation ?? [];
  const userAuthors = userPrefs.author ?? [];
  const userLength = userPrefs.book_length ?? [];
  const userAgeGroup = userPrefs.Age;
  const userCategories = Array.isArray(userPrefs.categories)
    ? userPrefs.categories
    : [];
  const bookCategoryId =
    typeof book.categoryId === "number"
      ? book.categoryId
      : (book.category?.id ?? book.category ?? null);

  const normalizedUserCategories = userCategories
    .map((c) => {
      if (typeof c === "string" && c.trim() !== "" && !isNaN(Number(c))) {
        return Number(c);
      }
      return c;
    })
    .filter((c) => c !== null && c !== undefined);

  // ----------- MOOD ( +2 ) -------------
  if (userMoods.length > 0 && bookMoods.some((m) => userMoods.includes(m))) {
    score += 2;
  }

  // ----------- AUTHOR ( +3 ) -------------
  if (userAuthors.length > 0 && userAuthors.includes(book.authorId)) {
    score += 3;
  }

  // ----------- MOTIVATION ( +3 ) -------------
  if (
    userMotivations.length > 0 &&
    bookMotivations.some((m) => userMotivations.includes(m))
  ) {
    score += 3;
  }

  // ----------- LENGTH ( +2 ) -------------
  if (userLength.length > 0 && book.length) {
    const pages = book.length;

    for (let len of userLength) {
      if (len === "کوتاه" && pages < 200) score += 2;
      if (len === "متوسط" && pages >= 200 && pages <= 400) score += 2;
      if (len === "بلند" && pages > 400) score += 2;
    }
  }

  // ----------- AGE GROUP ( +4 ) -------------
  if (userAgeGroup && book.Age && userAgeGroup === book.Age) {
    score += 4;
  }

  // ----------- CATEGORY ( +10 ) -------------
  // If user selected onboarding categories, boost books that match user's categories
  if (
    normalizedUserCategories.length > 0 &&
    bookCategoryId !== null &&
    bookCategoryId !== undefined &&
    normalizedUserCategories.includes(bookCategoryId)
  ) {
    score += 10;
  }

  return score;
}
