import { chunks } from "./chunks";

const ALL_LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'] as const;

export const generateGridLetter = (position: number, width: number) => {
  const rowNum = Math.floor(position / width);
  const colNum = position % width;
  const row = ALL_LETTERS[rowNum];
  const col = ALL_LETTERS[colNum];
  return `${row}${col}`
}

export const allColumnLetters = (height: number, width: number) =>
  new Array(height * width)
    .fill(null)
    .map((_, i) => generateGridLetter(i, width))

export const finalGrid = (resultRow: Record<string, string | null>, height: number, width: number) => {
  const finalTable = Object.fromEntries(allColumnLetters(height, width).map(key => [key, null as null | string]));
  for (const [key, value] of Object.entries(resultRow)) {
    const [_wordKey, letter] = key.split('_')
    finalTable[letter] = finalTable[letter] || value;
  }
  return finalTable
}
export const printGrid = (resultRow: Record<string, string | null>, height: number, width: number) => {
  const finalTable = finalGrid(resultRow, height, width);
  return Array.from(
    chunks(
      Object.values(finalTable).map(letter => letter || '.'),
      width
    )
  )
    .map(row => row.join(' '))
    .join("\n")
}

export const printWords = (resultRow: Record<string, string | null>, words: { range: number[]; key: string; }[], height: number, width: number) => {
  const finalTable = finalGrid(resultRow, height, width);
  words
    .sort((a, b) => a.key.localeCompare(b.key))
    .forEach(word => {
      const locationLetters = word.range.map(location => generateGridLetter(location, width));
      const finalWord = locationLetters.map(letter => finalTable[letter]).join('')
      console.info(finalWord);
    })
}