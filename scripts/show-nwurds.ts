const [_bun, _file, ...clues] = process.argv;
let clue = clues.join(' ');
// from https://www.theguardian.com/crosswords/cryptic/29525#17-down
clue ||= "Revolutionary device that reproduces itself when up-ended (7)";

const removeCount = (sentence: string) => sentence.trim().replace(/\(\d+\)$/, '').trim();
const splitSentence = (sentence: string) => sentence.split(/\s+/);

const toWurd = (words: string[], start: number) => {
    return {
        wurd: words,
        start,
    }
}
/**
 * An n-wurd is like an n-gram, but for words.
 * e.g. bi-wurds for "this and that" are:
 * - this and
 * - and that
 * 
 * We also retain information about the position of the wurd in the original context given
 */
type Wurd = ReturnType<typeof toWurd>

type nWurdsAccumulator = {
    currentStartIndex: number;
    wurds: Wurd[];
}
function nWurds(
    words: string[],
    n: number,
    acc: nWurdsAccumulator = { currentStartIndex: 0, wurds: [] }
) {
    if (words.length <= n) {
        const chunk = toWurd(words, acc.currentStartIndex);
        acc.wurds.push(chunk);
        return acc;
    }

    const nextSlice = words.slice(0, n);
    const offset = nextSlice[0].length;
    const chunk = toWurd(nextSlice, acc.currentStartIndex);
    const spaceBetweenWords = 1;
    acc.currentStartIndex += offset + spaceBetweenWords;
    acc.wurds.push(chunk);
    const next = words.slice(1);
    return nWurds(next, n, acc);
}

function allWurds(words: string[]) {
    const acc: nWurdsAccumulator = {
        currentStartIndex: 0,
        wurds: [],
    };
    for (let n = words.length; n > 0; n--) {
        acc.currentStartIndex = 0;
        nWurds(words, n, acc);
    }
    return acc.wurds;
}

const result = allWurds(
    splitSentence(
        removeCount(clue)
    ),
)

const midpoint = Math.floor(removeCount(clue).length / 2);
const byDistanceFromMidpoint = (a: Wurd, b: Wurd) => {
    const distanceA = a.start - midpoint;
    const distanceB = b.start - midpoint;
    return distanceA - distanceB;
}

for (const chunk of result.sort(byDistanceFromMidpoint)) {
    console.info(chunk.wurd.join(' ').padStart(chunk.start + chunk.wurd.join(' ').length, ' '));
}