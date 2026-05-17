export const VCodeGenerator = () => {
  const numbers = "1234567890"
    .split("")
    .map((value: string) => Number.parseInt(value));

  const randomIndexes = Array.from({ length: 6 }, () => {
      return Math.floor(Math.random() * 10);
    }),
    number = randomIndexes
      .map((arrIndex: number) => {
        return numbers[arrIndex];
      })
      .join("");

  return Number.parseInt(number);
};
