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

  words.select { |_key, value| value.length > 1 }
end

@words = parse_structure %w[
a1/d1 a1 a1/d2 a1 a1/d3
d1    .  d2    .  d3 
d1    .  d2    .  d3
.     .  d2    .  .
a4    a4 d2/a4 a4 a4
]

select = ->(word_key) { "select * from words as #{word_key}" }
where = ->(word_key) {
  letters = @words[word_key].map{ |letter| [letter.to_sym, :any] }.to_h
  "where #{constraints(word_key, **letters)[0]}"
}
join = ->(this_word_key, other_word_key, letter) {
  idx_this = @words.keys.index(this_word_key)
  idx_other = @words.keys.index(other_word_key)
  difference = idx_this - idx_other
  relative_cte_spacing = difference > 1 ? ":#{difference - 1}" : ""
  prev_word_key = @words.keys[idx_this - 1]
  "join #{prev_word_key} on #{prev_word_key}.\"#{letter}#{relative_cte_spacing}\" = #{this_word_key}.#{letter}"
}

query = <<-SQL
  with a1 as (
    #{select.("a1")}
    #{where.("a1")}
  ), d1 as (
    #{select.("d1")}
    #{join.("d1", "a1", "a")}
    #{where.("d1")}
  ), d2 as (
    #{select.("d2")}
    #{join.("d2", "a1", "c")}
    #{where.("d2")}
  ), d3 as (
    #{select.("d3")}
    #{join.("d3", "a1", "e")}
    #{where.("d3")}
  ), a4 as (
    #{select.("a4")}
    #{join.("a4", "d2", "w")}
    #{where.("a4")}
  )
  select * from a4
  limit 1
SQL
File.write "latest-query.sql", query

rows = db.execute query

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
