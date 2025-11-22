// recommendation logic 
export function scoreBook(book, userPrefs) {
  let score = 0;

  // Parse JSON array fields
  const bookGenres = Array.isArray(book.Genre) ? book.Genre : [];
  const bookMoods = Array.isArray(book.mood) ? book.mood : [];
  const bookMotivations = Array.isArray(book.Motivation) ? book.Motivation : [];

  const userGenres = userPrefs.Genre ?? [];
  const userMoods = userPrefs.mood ? [userPrefs.mood] : [];
  const userMotivations = userPrefs.Motivation ?? [];
  const userAuthors = userPrefs.author ?? [];
  const userLength = userPrefs.book_length ?? [];
  const userAgeGroup = userPrefs.Age;

  // ----------- GENRE ( +4 ) -------------
  if (userGenres.length > 0 && bookGenres.some(g => userGenres.includes(g))) {
    score += 4;
  }

  // ----------- MOOD ( +2 ) -------------
  if (userMoods.length > 0 && bookMoods.some(m => userMoods.includes(m))) {
    score += 2;
  }

  // ----------- AUTHOR ( +3 ) -------------
  if (userAuthors.length > 0 && userAuthors.includes(book.authorId)) {
    score += 3;
  }

  // ----------- MOTIVATION ( +3 ) -------------
  if (userMotivations.length > 0 && bookMotivations.some(m => userMotivations.includes(m))) {
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

  return score;
}