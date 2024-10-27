words = 
  File.readlines('1k.txt')
    .map(&:strip)
    .filter { |word| word.length <= 5 && word.length >= 3 }
    .sort

File.write "1k-up-to-5.txt", words.join("\n")
