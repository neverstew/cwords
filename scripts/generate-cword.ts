import { Database } from 'bun:sqlite'

const db = new Database("words.db");
const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y']

const [_bun, _file, structureFile, offset = 0] = process.argv;
if (!structureFile) throw "Pass a filename with a structure";

const inputFile = Bun.file(structureFile);
const content = await inputFile.text();
const lines = content.split("\n");

const isDefined = <T>(x: T | undefined | null): x is T => {
  return Boolean(x);
}

const cells = lines
  .slice(0, 5)
  .flatMap(line => line.trim().split(/\s+/));

const isAcrossStart = (idx: number) => {
  const cell = cells[idx];
  if (cell === '.') return false;

  const onRightBorder = idx % 5 === 4
  if (onRightBorder) return false;

  const nextCell = cells[idx + 1];
  if (nextCell === '.') return false;

  const onLeftBorder = idx % 5 === 0
  if (onLeftBorder) return cell !== '.';

  const prevCell = cells[idx - 1];
  return prevCell === '.';
}

const isDownStart = (idx: number) => {
  const cell = cells[idx];
  if (cell === '.') return false;

  const onBottomBorder = idx >= 20;
  if (onBottomBorder) return false;

  const nextCell = cells[idx + 5];
  if (nextCell === '.') return false

  const onTopBorder = idx <= 4;
  if (onTopBorder && cell !== '.') return true

  const prevCell = cells[idx - 5];
  return prevCell === '.'
}

const starts = new Set<number>();
const wordStarts = cells
  .map((_cell, idx) => {
    const directions: ('a' | 'd')[] = []
    if (isAcrossStart(idx)) directions.push('a')
    if (isDownStart(idx)) directions.push('d')

    if (directions.length > 0 ) starts.add(idx);
    return { start: idx, directions }
  })
  .flatMap(({ start, directions }) =>
    directions.map(direction =>({ start, direction }))
  )
  .filter(isDefined)

const wordsWithoutJoins = wordStarts
  .map(({ start, direction }) => {
    if (direction === 'a') {
      const startPoint = start;
      let currentPoint = start;
      const pointInRow = startPoint % 5;
      const pointsUntilEndOfRow = 5 - pointInRow;
      const maxPoint = startPoint + pointsUntilEndOfRow
      const range = [];
      while (currentPoint < maxPoint) {
        if (cells[currentPoint] === '.') break;
        range.push(currentPoint);
        currentPoint += 1;
      }
      return { start, direction, range };
    } else {
      const startPoint = start;
      let currentPoint = start;
      const pointInCol = Math.floor(startPoint / 5);
      const pointsUntilEndOfCol = 5 - pointInCol;
      const maxPoint = startPoint + pointsUntilEndOfCol * 5
      const range = [];
      while (currentPoint < maxPoint) {
        if (cells[currentPoint] === '.') break;
        range.push(currentPoint);
        currentPoint += 5;
      }
      return { start, direction, range };
    }
  })
  .map(word => {
    const sortedStarts = Array.from(starts).sort((a, b) => a - b);
    return {
      ...word,
      key: `${word.direction}${sortedStarts.indexOf(word.range[0]) + 1}`,
      joins: [] as (readonly [string, number])[],
    };
  })

const words = wordsWithoutJoins
  .map((word) => {
    const joins = [];
    for (const otherWord of wordsWithoutJoins) {
      if (otherWord.key === word.key) continue;
      for (const location of word.range) {
        if (otherWord.range.includes(location)) joins.push([otherWord.key, location] as const);
      }
    }
    word.joins = joins;
    return word;
  })

type Word = typeof words[number];

const tableConstraints = (word: Word) => {
  const conditions = []
  const values = []
  for (let location = 0; location < letters.length; location++) {
    const letter = letters[location];
    if (!word.range.includes(location)){
      conditions.push(`${word.key}.\"${letter}\" is null`)
      continue;
    }

    const value = cells[location];
    if (value === "+") {
      conditions.push(`${word.key}.\"${letter}\" is not null`)
    } else {
      conditions.push(`${word.key}.\"${letter}\" = ?`)
      values.push(value);
    }
  }

  return [conditions.join(' and '), values] as const
}

const joinConstraints = (word: Word) => {
  return word.joins
    .map(([key, location]) => {
      const letter = letters[location];
      return `${word.key}.\"${letter}\" = ${key}.\"${letter}\"`
    })
    .join(' and ')
}

const joinedWord = (wordKey: string) =>
  letters.map(letter => `COALESCE(${wordKey}.${letter}, '')`).join(' || ')

const wordKeys = words.map(w => w.key);
const uniqueWordConstraints = () => {
  const constraints = [];
  for (let i = 0; i < wordKeys.length; i++) {
    const thisKey = wordKeys[i];
    for (let j = i + 1; j < wordKeys.length; j++) {
      const nextKey = wordKeys[j];
      constraints.push(`(${joinedWord(thisKey)}) <> (${joinedWord(nextKey)})`)
    }
  }

  return constraints.join('\nand\n');
}

const constraints =
  [
    "-- table constraints",
    (words.map(word => tableConstraints(word)[0])).join("\n and "),
    "-- join constraints",
    "and ", words.map(word => joinConstraints(word)).join("\n and "),
    "--- unique word constraints",
    "and ", uniqueWordConstraints(),
  ].join("\n");

const query = `
  select ${words.flatMap(({ key }) => letters.map(letter => `"${key}"."${letter}" as ${key}_${letter}`))}
  from ${words.map(({ key }) => `words as ${key}`).join(', ')}
  where
  ${constraints}
  limit 1
  offset ${offset}
`
await Bun.write("latest-query.sql", query)

const queryValues = words.flatMap(word => tableConstraints(word)[1]);
const rows = await db.query(query).all(...queryValues) as Record<string, string | null>[];

function* chunks<T>(arr: T[], n: number) {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}

const printCrossword = (result: typeof rows[0]) => {
  const finalTable = Object.fromEntries(letters.map(key => [key, null as null | string]));
  for (const [key, value] of Object.entries(result)) {
    const [_wordKey, letter] = key.split('_')
    finalTable[letter] = finalTable[letter] || value;
  }

  Array.from(chunks(Object.values(finalTable).map(letter => letter || '.'), 5))
    .forEach(row => console.info(row.join(' ')))

  console.info("")

  words
    .forEach(word => {
      const locationLetters = word.range.map(location => letters[location]);
      const finalWord = locationLetters.map(letter => finalTable[letter]).join('')
      console.info(`${word.key}: ${finalWord} [${locationLetters.join(', ')}] [${word.range.join(', ')}]`)
    })
}

printCrossword(rows[0])
