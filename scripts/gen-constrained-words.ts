import { Database } from 'bun:sqlite'

const db = new Database("words.db");
const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y']

const [_bun, _file, structureFile] = process.argv;
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
        const lowerBound = 0
        const upperBound = Math.max(0, j - 1);
        const joinLocations = wordKeys
          .slice(lowerBound, upperBound + 1)
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

const constraints = (tableName: string, args: Record<string, string>) => {
  const conditions = []
  const values = []
  for (const letter of letters) {
    const value = args[letter]
    if (value === "__any__") {
      conditions.push(`${tableName}.\"${letter}\" is not null`)
    } else if (value) {
      conditions.push(`${tableName}.\"${letter}\" = ?`)
      values.push(value);
    } else {
      conditions.push(`${tableName}.\"${letter}\" is null`)
    }
  }

  return [conditions.join(' and '), values] as const
}

let queryValues: any[] = []
const select = (wordKey: string) => `select * from words as ${wordKey}`
const where = (wordKey: string) => {
  const grid_letters = words[wordKey]

  const word = wordConstraints[wordKey] || ''
  const word_letters = word.split('')

  const letters = Object.fromEntries(grid_letters.map((grid_letter, idx) => {
    const letter = word_letters[idx] || "__any__";
    return [grid_letter, letter]
  }))

  const [sql, values] = constraints(wordKey, letters)
  queryValues = queryValues.concat(...values)

  return `where ${sql}`
}
const join = (thisWordKey: string, joins: [string, string][]) => {
  const idx_this = Object.keys(words).indexOf(thisWordKey)
  const prev_word_key = Object.keys(words)[idx_this - 1]

  const joinConditions =
    joins.map(([other_word_key, letter]) => {
      const idx_other = Object.keys(words).indexOf(other_word_key)
      const difference = idx_this - idx_other
      const relative_cte_spacing = difference > 1 ? `:${difference - 1}` : ''
      return `${prev_word_key}."${letter}${relative_cte_spacing}" = ${thisWordKey}.${letter}`
    })
      .join(' and ')

  return `join ${prev_word_key} on ${joinConditions}`
}
const cte = (wordKey: string) => {
  const idx_this = Object.keys(words).indexOf(wordKey);
  return `
${idx_this === 0 ? 'with ' : ', '}${wordKey} as (
  ${select(wordKey)}
  ${idx_this == 0 ? '' : join(wordKey, joins[wordKey])}
  ${where(wordKey)}
)
  `
}
const ctes = Object.keys(words).map(word_key => cte(word_key)).join('')

const query = `
  ${ctes}
  select *
  from ${Object.keys(words).at(-1)}
  limit 1
  offset 25
`
await Bun.write("latest-query.sql", query)

const rows = await db.query(query).all(...queryValues) as Record<string, string | null>[];

function* chunks<T>(arr: T[], n: number) {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}

const printCrossword = (result: (string|null)[]) => {
  const finalTable = Array.from(chunks(result, 25)).reduce((acc, chunk) => {
    chunk.forEach((letter, i) => {
      acc[i] = acc[i] || letter;
    })
    return acc;
  }, new Array(25).fill(null))

  debugger;
  Array.from(chunks(finalTable.map(letter => letter || '.'), 5))
    .forEach(row => console.info(row.join(' ')))
  console.info("")
  Object.keys(words)
    .sort()
    .forEach(key => {
      const word = words[key]
        .map(grid_letter => finalTable[letters.indexOf(grid_letter)])
        .join('')
      console.info(`${key}: ${word}`)
    })
}

printCrossword(Object.values(rows[0]))
