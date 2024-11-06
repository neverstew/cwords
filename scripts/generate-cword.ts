import { Database } from 'bun:sqlite'

const db = new Database("words.db");
const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y']

const [_bun, _file, structureFile, offset = 0] = process.argv;
if (!structureFile) throw "Pass a filename with a structure";

const inputFile = Bun.file(structureFile);
const content = await inputFile.text();
const lines = content.split("\n");

const parseWordsFromFile = async () => {
  const words: Record<string, string[]> = {}

  lines
    .slice(0, 5)
    .flatMap(line => line.trim().split(/\s+/))
    .forEach((numEntry, i) => {
      const letter = letters[i]
      const nums = numEntry.split('/')
      for (const num of nums) {
        if (num === '.') continue;
        words[num] = (words[num] || [])
        words[num].push(letter)
      }
    })

  return Object.fromEntries(Object.entries(words).filter(([, value]) => value.length > 1))
}

const parseJoinsFromFile = () => {
  const joins: Record<string, [string, string][]> = {}
  lines
    .slice(0, 5)
    .flatMap(line => line.trim().split(/\s+/))
    .forEach((entry, i) => {
      const letter = letters[i]
      const wordKeys = entry.split('/')
      if (wordKeys.length <= 1) return;

      wordKeys.forEach((wordKey, j) => {
        const joinLocations = wordKeys
          .filter(key => key !== wordKey)
          .map(key => [key, letter] as [string, string])
        joins[wordKey] = joins[wordKey] || []
        for (const location of joinLocations) {
          joins[wordKey].push(location)
        }
      })
    })
  return joins;
}

const parseConstraintsFromFile = () => {
  return Object.fromEntries(
    lines
      .slice(5)
      .filter(line => line.length > 0)
      .map(line => {
        const [wordKey, word] = line.split(': ');
        return [wordKey, word]
      })
  )
}

const words = await parseWordsFromFile()
const wordConstraints = await parseConstraintsFromFile()
const joins = await parseJoinsFromFile()

const wordKeys = Object.keys(words);

const tableConstraints = (wordKey: string) => {
  const gridLetters = words[wordKey];
  const word = wordConstraints[wordKey] || ''
  const wordLetters = word.split('')
  const wordLetterPositions = Object.fromEntries(gridLetters.map((gridLetter, idx) => {
    const letter = wordLetters[idx] || "__any__";
    return [gridLetter, letter]
  }))

  const conditions = []
  const values = []
  for (const letter of letters) {
    const value = wordLetterPositions[letter]
    if (value === "__any__") {
      conditions.push(`${wordKey}.\"${letter}\" is not null`)
    } else if (value) {
      conditions.push(`${wordKey}.\"${letter}\" = ?`)
      values.push(value);
    } else {
      conditions.push(`${wordKey}.\"${letter}\" is null`)
    }
  }

  return [conditions.join(' and '), values] as const
}

const joinConstraints = (wordKey: string) => {
  return joins[wordKey]
    .map(([key, letter]) => `${wordKey}.\"${letter}\" = ${key}.\"${letter}\"`)
    .join(' and ')
}

const joinedWord = (wordKey: string) => 
  letters.map(letter => `COALESCE(${wordKey}.${letter}, '')`).join(' || ')

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
    (wordKeys.map(key => tableConstraints(key)[0])).join("\n and "),
    "-- join constraints",
    "and ", wordKeys.map(key => joinConstraints(key)).join("\n and "),
    "--- unique word constraints",
    "and ", uniqueWordConstraints(),
  ].join("\n");

const query = `
  select ${wordKeys.flatMap((key) => letters.map(letter => `"${key}"."${letter}" as ${key}_${letter}`))}
  from ${wordKeys.map(wordKey => `words as ${wordKey}`).join(', ')}
  where
  ${constraints}
  limit 1
  offset ${offset}
`
await Bun.write("latest-query.sql", query)

const rows = await db.query(query).all(...wordKeys.flatMap(key => tableConstraints(key)[1])) as Record<string, string | null>[];

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

  wordKeys
    .sort()
    .forEach(key => {
      debugger;
      const word = words[key]
        .map(gridLetter => finalTable[gridLetter])
        .join('')
      console.info(`${key}: ${word}`)
    })
}

printCrossword(rows[0])
