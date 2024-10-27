require 'sqlite3'

words = 
  File.readlines('1k-up-to-5.txt')
    .map(&:strip)

db = SQLite3::Database.new "words.db"

# Create a table with one column for each cell
db.execute <<-SQL
  create table if not exists words (
    a, b, c, d, e,
    f, g, h, i, j,
    k, l, m, n, o,
    p, q, r, s, t,
    u, v, w, x, y
  );
SQL

words.each do |word|
  puts "inserting #{word}"
  if word.length == 3
    # across
    db.execute "insert into words(a, b, c) values (?, ?, ?)", word[1], word[1], word[2]
    db.execute "insert into words(b, c, d) values (?, ?, ?)", word[0], word[1], word[2]
    db.execute "insert into words(d, e, f) values (?, ?, ?)", word[0], word[1], word[2]
    db.execute "insert into words(f, g, h) values (?, ?, ?)", word[0], word[1], word[2]
    db.execute "insert into words(g, h, i) values (?, ?, ?)", word[0], word[1], word[2]
    db.execute "insert into words(h, i, j) values (?, ?, ?)", word[0], word[1], word[2]
    db.execute "insert into words(k, l, m) values (?, ?, ?)", word[0], word[1], word[2]
    db.execute "insert into words(l, m, n) values (?, ?, ?)", word[0], word[1], word[2]
    db.execute "insert into words(m, n, o) values (?, ?, ?)", word[0], word[1], word[2]
    db.execute "insert into words(p, q, r) values (?, ?, ?)", word[0], word[1], word[2]
    db.execute "insert into words(q, r, s) values (?, ?, ?)", word[0], word[1], word[2]
    db.execute "insert into words(r, s, t) values (?, ?, ?)", word[0], word[1], word[2]
    db.execute "insert into words(u, v, w) values (?, ?, ?)", word[0], word[1], word[2]
    db.execute "insert into words(v, w, x) values (?, ?, ?)", word[0], word[1], word[2]
    db.execute "insert into words(w, x, y) values (?, ?, ?)", word[0], word[1], word[2]
    # down
    db.execute "insert into words(a, f, k) values (?, ?, ?)", word[1], word[1], word[2]
    db.execute "insert into words(f, k, p) values (?, ?, ?)", word[0], word[1], word[2]
    db.execute "insert into words(k, p, u) values (?, ?, ?)", word[0], word[1], word[2]
    db.execute "insert into words(b, g, l) values (?, ?, ?)", word[0], word[1], word[2]
    db.execute "insert into words(g, l, q) values (?, ?, ?)", word[0], word[1], word[2]
    db.execute "insert into words(l, q, v) values (?, ?, ?)", word[0], word[1], word[2]
    db.execute "insert into words(c, h, m) values (?, ?, ?)", word[0], word[1], word[2]
    db.execute "insert into words(h, m, r) values (?, ?, ?)", word[0], word[1], word[2]
    db.execute "insert into words(m, r, w) values (?, ?, ?)", word[0], word[1], word[2]
    db.execute "insert into words(d, i, n) values (?, ?, ?)", word[0], word[1], word[2]
    db.execute "insert into words(i, n, s) values (?, ?, ?)", word[0], word[1], word[2]
    db.execute "insert into words(n, s, x) values (?, ?, ?)", word[0], word[1], word[2]
    db.execute "insert into words(e, j, o) values (?, ?, ?)", word[0], word[1], word[2]
    db.execute "insert into words(j, o, t) values (?, ?, ?)", word[0], word[1], word[2]
    db.execute "insert into words(o, t, y) values (?, ?, ?)", word[0], word[1], word[2]
  elsif word.length == 4
    # across
    db.execute "insert into words(a, b, c, d) values (?, ?, ?, ?)", word[0], word[1], word[2], word[3]
    db.execute "insert into words(b, c, d, e) values (?, ?, ?, ?)", word[0], word[1], word[2], word[3]
    db.execute "insert into words(f, g, h, i) values (?, ?, ?, ?)", word[0], word[1], word[2], word[3]
    db.execute "insert into words(g, h, i, j) values (?, ?, ?, ?)", word[0], word[1], word[2], word[3]
    db.execute "insert into words(k, l, m, n) values (?, ?, ?, ?)", word[0], word[1], word[2], word[3]
    db.execute "insert into words(l, m, n, o) values (?, ?, ?, ?)", word[0], word[1], word[2], word[3]
    db.execute "insert into words(p, q, r, s) values (?, ?, ?, ?)", word[0], word[1], word[2], word[3]
    db.execute "insert into words(q, r, s, t) values (?, ?, ?, ?)", word[0], word[1], word[2], word[3]
    db.execute "insert into words(u, v, w, x) values (?, ?, ?, ?)", word[0], word[1], word[2], word[3]
    db.execute "insert into words(v, w, x, y) values (?, ?, ?, ?)", word[0], word[1], word[2], word[3]
    # down
    db.execute "insert into words(a, f, k, p) values (?, ?, ?, ?)", word[0], word[1], word[2], word[3]
    db.execute "insert into words(f, k, p, u) values (?, ?, ?, ?)", word[0], word[1], word[2], word[3]
    db.execute "insert into words(b, g, l, q) values (?, ?, ?, ?)", word[0], word[1], word[2], word[3]
    db.execute "insert into words(g, l, q, v) values (?, ?, ?, ?)", word[0], word[1], word[2], word[3]
    db.execute "insert into words(c, h, m, r) values (?, ?, ?, ?)", word[0], word[1], word[2], word[3]
    db.execute "insert into words(h, m, r, w) values (?, ?, ?, ?)", word[0], word[1], word[2], word[3]
    db.execute "insert into words(d, i, n, s) values (?, ?, ?, ?)", word[0], word[1], word[2], word[3]
    db.execute "insert into words(i, n, s, x) values (?, ?, ?, ?)", word[0], word[1], word[2], word[3]
    db.execute "insert into words(e, j, o, t) values (?, ?, ?, ?)", word[0], word[1], word[2], word[3]
    db.execute "insert into words(j, o, t, y) values (?, ?, ?, ?)", word[0], word[1], word[2], word[3]
  elsif word.length == 5
    # across
    db.execute "insert into words(a, b, c, d, e) values (?, ?, ?, ?, ?)", word[0], word[1], word[2], word[3], word[4]
    db.execute "insert into words(f, g, h, i, j) values (?, ?, ?, ?, ?)", word[0], word[1], word[2], word[3], word[4]
    db.execute "insert into words(k, l, m, n, o) values (?, ?, ?, ?, ?)", word[0], word[1], word[2], word[3], word[4]
    db.execute "insert into words(p, q, r, s, t) values (?, ?, ?, ?, ?)", word[0], word[1], word[2], word[3], word[4]
    db.execute "insert into words(u, v, w, x, y) values (?, ?, ?, ?, ?)", word[0], word[1], word[2], word[3], word[4]
    # down
    db.execute "insert into words(a, f, k, p, u) values (?, ?, ?, ?, ?)", word[0], word[1], word[2], word[3], word[4]
    db.execute "insert into words(b, g, l, q, v) values (?, ?, ?, ?, ?)", word[0], word[1], word[2], word[3], word[4]
    db.execute "insert into words(c, h, m, r, w) values (?, ?, ?, ?, ?)", word[0], word[1], word[2], word[3], word[4]
    db.execute "insert into words(d, i, n, s, x) values (?, ?, ?, ?, ?)", word[0], word[1], word[2], word[3], word[4]
    db.execute "insert into words(e, j, o, t, y) values (?, ?, ?, ?, ?)", word[0], word[1], word[2], word[3], word[4]
  end
end
