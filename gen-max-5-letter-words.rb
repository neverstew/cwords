words = 
  File.readlines('20k.txt')
    .map(&:strip)
    .filter { |word| word.length <= 5 && word.length >= 3 }
    .sort

File.write "words-up-to-5.txt", words.join("\n")
