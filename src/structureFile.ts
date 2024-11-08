export const parseFile = async (filename: string) => {
    const inputFile = Bun.file(filename);
    const content = await inputFile.text();
    const lines = content.split("\n");

    const [lineOne] = lines;
    const width = lineOne.split(/\s+/).length;
    if (width > 25) throw "Only grids up to 25 wide are supported."

    let height = 0;
    for (const line of lines) {
    if (line.trim().length === 0) break
    height++
    }
    if (height > 25) throw "Only grids up to 25 high are supported."

    const totalLetters = width * height;

    return {
        lines,
        width,
        height,
        totalLetters,
    }
}