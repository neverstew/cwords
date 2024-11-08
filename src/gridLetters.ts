const ALL_LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'] as const;

export const generateGridLetter = (position: number, width: number) => {
  const rowNum = Math.floor(position / width);
  const colNum = position % width;
  const row = ALL_LETTERS[rowNum];
  const col = ALL_LETTERS[colNum];
  return `${row}${col}`
}