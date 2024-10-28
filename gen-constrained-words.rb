require 'sqlite3'
require 'pp'
require 'debug'

db = SQLite3::Database.new "words.db"

@letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y']

def parse_words_from_file(file_name)
  structure_file = File.readlines(file_name)
  words = {}
   
  structure_file[..4]
    .map { |line| line.strip.split ' ' }
    .flatten
    .each_with_index do |nums, i|
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

def parse_joins_from_file(file_name)
   structure_file = File.readlines(file_name)

   joins = {}
   structure_file[..4]
    .map { |line| line.strip.split ' ' }
    .flatten
    .each_with_index do |entry, i|
      letter = @letters[i]
      word_keys = entry.split('/')
      next unless word_keys.length > 1
     
      word_keys.each_with_index do |word_key, j|
        lower_bound = 0
        upper_bound = [0, j-1].max
        other_keys_range = lower_bound..upper_bound
        other_keys = word_keys[other_keys_range]
          .reject { |key| key == word_key }
          .map { |key| [key, letter] }
        word_joins = joins[word_key] || []
        word_joins += other_keys
        joins[word_key] = word_joins
      end
    end

   joins
end

def parse_constraints_from_file(file_name)
  structure_file = File.readlines(file_name)
  constraint_lines = 

  structure_file[5..]
    .reject { |line| line.strip.length == 0 }
    .map do |line|
      word_key, word = line.split(': ')
      [word_key, word]
    end
    .to_h
end

filename = ARGV[0]
raise "Pass a filename with a structure" unless filename

@words = parse_words_from_file filename
@word_constraints = parse_constraints_from_file filename
@joins = parse_joins_from_file filename

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

@query_values = []
select = ->(word_key) { "select * from words as #{word_key}" }
where = ->(word_key) {
  grid_letters = @words[word_key]

  word = @word_constraints[word_key] || ''
  word_letters = word.split('')

  letters = grid_letters.each_with_index.map do |grid_letter, idx|
    letter = word_letters[idx] || :any
    [grid_letter.to_sym, letter]
  end.to_h

  sql, values = constraints(word_key, **letters)
  @query_values += values

  "where #{sql}"
}
join = ->(this_word_key, *joins) {
  idx_this = @words.keys.index(this_word_key)
  prev_word_key = @words.keys[idx_this - 1]

  join_conditions =
    joins.map do |other_word_key, letter|
      idx_other = @words.keys.index(other_word_key)
      difference = idx_this - idx_other
      relative_cte_spacing = difference > 1 ? ":#{difference - 1}" : ""
      "#{prev_word_key}.\"#{letter}#{relative_cte_spacing}\" = #{this_word_key}.#{letter}"
    end
    .join(' and ')

  "join #{prev_word_key} on #{join_conditions}"
}
cte = ->(word_key) {
  idx_this = @words.keys.index(word_key)
  "
  #{idx_this == 0 ? 'with ' : ', '}#{word_key} as (
    #{select.(word_key)}
    #{idx_this == 0 ? '' : join.(word_key, *@joins[word_key])}
    #{where.(word_key)}
  )
  "
}
ctes = @words.keys.map { |word_key| cte.(word_key) }.join

query = <<-SQL
  #{ctes}
  select *
  from #{@words.keys[-1]}
  limit 1
  offset 25
SQL
File.write "latest-query.sql", query

rows = db.execute query, @query_values

def print_crossword(result)
  final_table = (1..25).map { nil }
  result.each_slice(25) do |table|
    (0..24).each do |i|
      next if final_table[i]
      final_table[i] = table[i]
    end
  end
  final_table.map{ |letter| letter || '.' }.each_slice(5){ |row| puts row.join(' ') }
  puts ""
  @words
    .keys.sort
    .each { |key|
      word = @words[key].map{|grid_letter| final_table[@letters.index(grid_letter)]}.join('')
      puts "#{key}: #{word}"
    }
end

print_crossword(rows[0])
