//matching age groups: 
export function matchesAgeGroup(userAge, bookAgeGroup) {
  if (!userAge || !bookAgeGroup) return false;

  switch (bookAgeGroup) {
    case "۱۲–۱۷":
      return userAge >= 12 && userAge <= 17;
    case "۱۸–۲۵":
      return userAge >= 18 && userAge <= 25;
    case "۲۶–۳۵":
      return userAge >= 26 && userAge <= 35;
    case "۳۶–۵۰":
      return userAge >= 36 && userAge <= 50;
    case "۵۰+":
      return userAge >= 50;
    default:
      return false;
  }
}


// our recommendation logic 
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
  if (userPrefs.Age && book.Age && matchesAgeGroup(userPrefs.Age, book.Age)) {
    score += 4;
  }

  return score;
}