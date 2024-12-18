import { Database } from 'bun:sqlite';
import { allColumnLetters, printGrid, printWords } from '../src/grid';
import { isDefined } from '../src/isDefined';
import { parseFile } from '../src/structureFile';

const db = new Database("words.db");

const [_bun, _file, structureFile = "structure.txt", offset = 0, format = 'txt'] = process.argv;
if (!structureFile) throw "Pass a filename with a structure";

const {
  lines,
  totalLetters,
  height,
  width,
} = await parseFile(structureFile);

const allColumns = allColumnLetters(height, width);

const cells = lines
  .slice(0, height)
  .flatMap(line => line.trim().split(/\s+/));

const isAcrossStart = (idx: number) => {
  const cell = cells[idx];
  if (cell === '.') return false;

  const onRightBorder = idx % width === width - 1
  if (onRightBorder) return false;

  const nextCell = cells[idx + 1];
  if (nextCell === '.') return false;

  const onLeftBorder = idx % width === 0
  if (onLeftBorder) return cell !== '.';

  const prevCell = cells[idx - 1];
  return prevCell === '.';
}

const isDownStart = (idx: number) => {
  const cell = cells[idx];
  if (cell === '.') return false;

  const onBottomBorder = idx >= (height - 1) * width;
  if (onBottomBorder) return false;

  const nextCell = cells[idx + width];
  if (nextCell === '.') return false

  const onTopBorder = idx <= (height - 1);
  if (onTopBorder && cell !== '.') return true

  const prevCell = cells[idx - width];
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
      const pointInRow = startPoint % width;
      const pointsUntilEndOfRow = width - pointInRow;
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
      const pointsUntilEndOfCol = height - pointInCol;
      const maxPoint = startPoint + pointsUntilEndOfCol * width
      const range = [];
      while (currentPoint < maxPoint) {
        if (cells[currentPoint] === '.') break;
        range.push(currentPoint);
        currentPoint += width;
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
  for (let location = 0; location < totalLetters; location++) {
    const letter = allColumns[location];
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
      const letter = allColumns[location];
      return `${word.key}.\"${letter}\" = ${key}.\"${letter}\"`
    })
    .join(' and ')
}

const joinedWord = (wordKey: string) => allColumns
  .map(letter => `COALESCE(${wordKey}.${letter}, '')`)
  .join(' || ')

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
  select ${words.flatMap(({ key }) => allColumns.map(letter => `"${key}"."${letter}" as ${key}_${letter}`))}
  from ${words.map(({ key }) => `words as ${key}`).join(', ')}
  where
  ${constraints}
  limit 1
  offset ${offset}
`
await Bun.write("latest-query.sql", query)

const queryValues = words.flatMap(word => tableConstraints(word)[1]);
const rows = await db.query(query).all(...queryValues) as Record<string, string | null>[];

if (rows.length === 0) {
  console.info("No solutions to this structure, sorry!");
  process.exit(1);
}

if (format === 'txt') {
  console.info(printGrid(rows[0], height, width));
  console.info('');
  printWords(rows[0], words, height, width)
} else if (format === 'json') {
  const puzzle = printGrid(rows[0], height, width);
  console.info(JSON.stringify({
    puzzle,
    words: Object.fromEntries(words.map(word => [word.key, { clue: "", range: word.range, counts: `(${word.range.length})` }] as const).sort(([keyA], [keyB]) => keyA.localeCompare(keyB))),
  }, null, 4))
} else {
  console.error("Unsupported format");
}