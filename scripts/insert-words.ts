// require 'sqlite3'
import { Database } from 'bun:sqlite'

const db = new Database("scripts/words.db");

const inputFile = Bun.file("1k-up-to-5.txt");
const content = await inputFile.text();
const words = content.split("\n").map(l => l.trim());

// Create a table with one column for each cell
await db.run(`
  create table if not exists words (
    a, b, c, d, e,
    f, g, h, i, j,
    k, l, m, n, o,
    p, q, r, s, t,
    u, v, w, x, y
  );
`);

for (const word of words) {
  console.info(`inserting ${word}`);
  if (word.length === 3) {
    // across
    await db.run("insert into words(a, b, c) values (?, ?, ?)", [word[1], word[1], word[2]]);
    await db.run("insert into words(b, c, d) values (?, ?, ?)", [word[0], word[1], word[2]]);
    await db.run("insert into words(d, e, f) values (?, ?, ?)", [word[0], word[1], word[2]]);
    await db.run("insert into words(f, g, h) values (?, ?, ?)", [word[0], word[1], word[2]]);
    await db.run("insert into words(g, h, i) values (?, ?, ?)", [word[0], word[1], word[2]]);
    await db.run("insert into words(h, i, j) values (?, ?, ?)", [word[0], word[1], word[2]]);
    await db.run("insert into words(k, l, m) values (?, ?, ?)", [word[0], word[1], word[2]]);
    await db.run("insert into words(l, m, n) values (?, ?, ?)", [word[0], word[1], word[2]]);
    await db.run("insert into words(m, n, o) values (?, ?, ?)", [word[0], word[1], word[2]]);
    await db.run("insert into words(p, q, r) values (?, ?, ?)", [word[0], word[1], word[2]]);
    await db.run("insert into words(q, r, s) values (?, ?, ?)", [word[0], word[1], word[2]]);
    await db.run("insert into words(r, s, t) values (?, ?, ?)", [word[0], word[1], word[2]]);
    await db.run("insert into words(u, v, w) values (?, ?, ?)", [word[0], word[1], word[2]]);
    await db.run("insert into words(v, w, x) values (?, ?, ?)", [word[0], word[1], word[2]]);
    await db.run("insert into words(w, x, y) values (?, ?, ?)", [word[0], word[1], word[2]]);
    // down
    await db.run("insert into words(f, k, p) values (?, ?, ?)", [word[0], word[1], word[2]]);
    await db.run("insert into words(k, p, u) values (?, ?, ?)", [word[0], word[1], word[2]]);
    await db.run("insert into words(b, g, l) values (?, ?, ?)", [word[0], word[1], word[2]]);
    await db.run("insert into words(g, l, q) values (?, ?, ?)", [word[0], word[1], word[2]]);
    await db.run("insert into words(l, q, v) values (?, ?, ?)", [word[0], word[1], word[2]]);
    await db.run("insert into words(c, h, m) values (?, ?, ?)", [word[0], word[1], word[2]]);
    await db.run("insert into words(h, m, r) values (?, ?, ?)", [word[0], word[1], word[2]]);
    await db.run("insert into words(m, r, w) values (?, ?, ?)", [word[0], word[1], word[2]]);
    await db.run("insert into words(d, i, n) values (?, ?, ?)", [word[0], word[1], word[2]]);
    await db.run("insert into words(i, n, s) values (?, ?, ?)", [word[0], word[1], word[2]]);
    await db.run("insert into words(n, s, x) values (?, ?, ?)", [word[0], word[1], word[2]]);
    await db.run("insert into words(e, j, o) values (?, ?, ?)", [word[0], word[1], word[2]]);
    await db.run("insert into words(j, o, t) values (?, ?, ?)", [word[0], word[1], word[2]]);
    await db.run("insert into words(o, t, y) values (?, ?, ?)", [word[0], word[1], word[2]]);
  }
  else if (word.length === 4) {
    await db.run("insert into words(a, b, c, d) values (?, ?, ?, ?)", [word[0], word[1], word[2], word[3]]);
    await db.run("insert into words(b, c, d, e) values (?, ?, ?, ?)", [word[0], word[1], word[2], word[3]]);
    await db.run("insert into words(f, g, h, i) values (?, ?, ?, ?)", [word[0], word[1], word[2], word[3]]);
    await db.run("insert into words(g, h, i, j) values (?, ?, ?, ?)", [word[0], word[1], word[2], word[3]]);
    await db.run("insert into words(k, l, m, n) values (?, ?, ?, ?)", [word[0], word[1], word[2], word[3]]);
    await db.run("insert into words(l, m, n, o) values (?, ?, ?, ?)", [word[0], word[1], word[2], word[3]]);
    await db.run("insert into words(p, q, r, s) values (?, ?, ?, ?)", [word[0], word[1], word[2], word[3]]);
    await db.run("insert into words(q, r, s, t) values (?, ?, ?, ?)", [word[0], word[1], word[2], word[3]]);
    await db.run("insert into words(u, v, w, x) values (?, ?, ?, ?)", [word[0], word[1], word[2], word[3]]);
    await db.run("insert into words(v, w, x, y) values (?, ?, ?, ?)", [word[0], word[1], word[2], word[3]]);
    await db.run("insert into words(a, f, k, p) values (?, ?, ?, ?)", [word[0], word[1], word[2], word[3]]);
    await db.run("insert into words(f, k, p, u) values (?, ?, ?, ?)", [word[0], word[1], word[2], word[3]]);
    await db.run("insert into words(b, g, l, q) values (?, ?, ?, ?)", [word[0], word[1], word[2], word[3]]);
    await db.run("insert into words(g, l, q, v) values (?, ?, ?, ?)", [word[0], word[1], word[2], word[3]]);
    await db.run("insert into words(c, h, m, r) values (?, ?, ?, ?)", [word[0], word[1], word[2], word[3]]);
    await db.run("insert into words(h, m, r, w) values (?, ?, ?, ?)", [word[0], word[1], word[2], word[3]]);
    await db.run("insert into words(d, i, n, s) values (?, ?, ?, ?)", [word[0], word[1], word[2], word[3]]);
    await db.run("insert into words(i, n, s, x) values (?, ?, ?, ?)", [word[0], word[1], word[2], word[3]]);
    await db.run("insert into words(e, j, o, t) values (?, ?, ?, ?)", [word[0], word[1], word[2], word[3]]);
    await db.run("insert into words(j, o, t, y) values (?, ?, ?, ?)", [word[0], word[1], word[2], word[3]]);
  }
  else if (word.length === 5) {
    await db.run("insert into words(a, b, c, d, e) values (?, ?, ?, ?, ?)", [word[0], word[1], word[2], word[3], word[4]]);
    await db.run("insert into words(f, g, h, i, j) values (?, ?, ?, ?, ?)", [word[0], word[1], word[2], word[3], word[4]]);
    await db.run("insert into words(k, l, m, n, o) values (?, ?, ?, ?, ?)", [word[0], word[1], word[2], word[3], word[4]]);
    await db.run("insert into words(p, q, r, s, t) values (?, ?, ?, ?, ?)", [word[0], word[1], word[2], word[3], word[4]]);
    await db.run("insert into words(u, v, w, x, y) values (?, ?, ?, ?, ?)", [word[0], word[1], word[2], word[3], word[4]]);
    await db.run("insert into words(a, f, k, p, u) values (?, ?, ?, ?, ?)", [word[0], word[1], word[2], word[3], word[4]]);
    await db.run("insert into words(b, g, l, q, v) values (?, ?, ?, ?, ?)", [word[0], word[1], word[2], word[3], word[4]]);
    await db.run("insert into words(c, h, m, r, w) values (?, ?, ?, ?, ?)", [word[0], word[1], word[2], word[3], word[4]]);
    await db.run("insert into words(d, i, n, s, x) values (?, ?, ?, ?, ?)", [word[0], word[1], word[2], word[3], word[4]]);
    await db.run("insert into words(e, j, o, t, y) values (?, ?, ?, ?, ?)", [word[0], word[1], word[2], word[3], word[4]]);
  }
}
