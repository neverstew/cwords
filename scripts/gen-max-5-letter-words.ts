const inputFile = Bun.file("1k.txt");
const content = await inputFile.text();
await Bun.write(
  "1k-up-to-5.txt",
  content
    .split("\n")
    .map(l => l.trim())
    .filter(word => word.length <= 5 && word.length >= 3 )
    .sort()
    .join("\n")
)