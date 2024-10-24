require 'sqlite3'
require 'pp'
require 'debug'

db = SQLite3::Database.new "words.db"

@letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y']

# Example:
# cat = constraints("words", a: "c", b: "a", c: "t", d: "s")
# rows = db.execute "select * from words where #{cat[0]}", *cat[1]
# any_word = constraints("words", a: :any, b: :any, c: :any, d: :any)
# rows = db.execute "select * from words where #{any_word[0]}", *any_word[1]
def constraints(table_name, **args)
  conditions = []
  values = []
  @letters.each do |letter|
    value = args[letter.to_sym]
    if value == :any
      conditions << "#{table_name}.\"#{letter}\" is not null"
    elsif value
      conditions << "#{table_name}.\"#{letter}\" = ?"
      values << value
    else
      conditions << "#{table_name}.\"#{letter}\" is null"
    end
  end

  [conditions.join(' and '), values]
end

def parse_structure(structure)
  words = {}
   
  structure.each_with_index do |nums, i|
    letter = @letters[i]
    nums = nums.split('/')
    nums.each do |num|
      next if num == '.'
      words[num] = (words[num] || [])
      words[num] << letter
    end
  end

  across = words.select { |key, value| key.end_with?('a') && value.length > 1 }
  down = words.select { |key, value| key.end_with?('d') && value.length > 1 }

  [across, down]
end

pp parse_structure %w[
1a/1d 1a 1a/2d 1a 1a/3d
1d    .  2d    .  3d 
1d    .  2d    .  3d
.     .  2d    .  .
4a    4a 2d/4a 4a 4a
]

exit(0)

rows = db.execute <<-SQL
  with one_across as (
    select * from words
    where #{constraints("words", a: :any, b: :any, c: :any, d: :any, e: :any)[0]}
  ), one_down as (
    select * from words as one_down
    join one_across on one_across.a = one_down.a
    where #{constraints("one_down", a: :any, f: :any, k: :any)[0]}
  ), two_down as (
    select * from words as two_down
    join one_down on one_down."c:1" = two_down.c
    where #{constraints("two_down", c: :any, h: :any, m: :any, r: :any, w: :any)[0]}
  ), three_down as (
    select * from words as three_down
    join two_down on two_down."e:2" = three_down.e
    where #{constraints("three_down", e: :any, j: :any, o: :any)[0]}
  ), four_across as (
    select * from words as four_across
    join three_down on three_down."w:1" = four_across.w
    where #{constraints("four_across", u: :any, v: :any, w: :any, x: :any, y: :any)[0]}
  )
  select * from four_across
  limit 1 offset 104557
SQL

def print_crossword(result)
  final_table = (1..25).map { nil }
  result.each_slice(25) do |table|
    (0..24).each do |i|
      next if final_table[i]
      final_table[i] = table[i]
    end
  end
  final_table.each_slice(5){ |row| pp row }
end

print_crossword(rows[0])
