export const generateRandomString = (numberOfDigit = 6) : string => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomString = "";

    for (let i = 0; i < numberOfDigit; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }

    return randomString;
}

export const getRandomElement = (list: Array<any>, count: number = 1): any => {
  const shuffled = list.sort(() => 0.5 - Math.random());

  if (count === list.length) return shuffled;
  if (count > list.length) return shuffled.slice(0, 1)[0];
  const selected = shuffled.slice(0, count);
  return count === 1 ? selected[0] : selected;
}