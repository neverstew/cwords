require 'pp'

words = File.readlines 'words.txt'

words_by_length =
  words
  .map(&:strip)
  .group_by(&:length)

words_by_length.delete 18
words_by_length.delete 17
words_by_length.delete 16
words_by_length.delete 15
words_by_length.delete 14
words_by_length.delete 13
words_by_length.delete 12
words_by_length.delete 11

structure = %w[
x x x x x x x x . . 
x . . x . . x . . . 
x x x x . . x . . . 
x . . x x x x x x x 
x . . x . . . x . x 
x x x x x x . x x x 
. x . . x . . x . x 
. x . . x . . x x x 
. x . . x . . x . x 
. . . . x x x x x x 
]

groups = []
structure
  .each_slice(10) {|row|
    chunks = row.chunk_while {|left, right| left == 'x' && right == 'x'}
                 .filter {|row| row.length > 1}

    pp chunks
    chunks
  }
