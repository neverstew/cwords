import { Database } from 'bun:sqlite'
import { parseFile } from '../src/structureFile';
import { generateGridLetter } from '../src/gridLetters';

const db = new Database("words.db");

const [_bun, _file, wordsFile] = process.argv;
if (!wordsFile) throw "Pass a filename with a list of words";
const inputFile = Bun.file(wordsFile);

const content = await inputFile.text();
const words = content.split("\n").map(l => l.trim());

const {
  totalLetters,
  height,
  width,
} = await parseFile("structure.txt");

const allColumns = new Array(totalLetters)
  .fill(null)
  .map((_, i) => generateGridLetter(i, width))

await db.run(`drop table if exists words;`);
await db.run(`
  create table words (${allColumns.join(', ')});
`);

const logFile = Bun.file("latest-import.sql");
const logWriter = logFile.writer();
for (const word of words) {
  console.info(`inserting ${word}`);
  // across
  for (let row = 0; row < height; row++) {
    for (let col = 0; col <= (width - word.length); col++) {
      const start = row * width + col;
      const gridLetters = new Array(word.length).fill(null).map((_, k) => generateGridLetter(start + k, width));
      const query = `insert into words(${gridLetters.join(', ')}) values (${gridLetters.map(() => '?')})`
      const values = word.split('');
      logWriter.write(query + ";\n")
      await db.run(query, values);
    }
  }
  // down
  for (let col = 0; col < width; col++) {
    for (let row = 0; row <= (height - word.length); row++) {
      const start = row * width + col;
      const gridLetters = new Array(word.length).fill(null).map((_, k) => generateGridLetter(start + k * width, width));
      const query = `insert into words(${gridLetters.join(', ')}) values (${gridLetters.map(() => '?')})`
      const values = word.split('');
      logWriter.write(query + ";\n")
      await db.run(query, values);
    }
  }
  logWriter.flush();
}
