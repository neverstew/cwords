const [_bun, _file, ...clues] = process.argv;
let clue = clues.join(' ');
// from https://www.theguardian.com/crosswords/cryptic/29525#17-down
clue ||= "Hamlet's struggle to hold bitterness back (7)";

const removeCount = (sentence: string) => sentence.trim().replace(/\(\d+\)$/, '').trim();
clue = removeCount(clue)

const splitSentence = (sentence: string) => sentence.split(/\s+/);

/**
 * An n-wurd is like an n-gram, but for words.
 * e.g. bi-wurds for "this and that" are:
 * - this and
 * - and that
 * 
 * We also retain information about the position of the wurd in the original context given
 */
export type Wurd = {
    wurd: string[];
    start: number;
    end: number;
}

const toLength = (x: string) => x.length;
const totalWordLength = (words: string[]) => words.map(toLength).reduce(sum, 0);

const sum = (el: number, sum: number): number => sum + el;
export const toWurd = (words: string[], start: number) => {
    return {
        wurd: words,
        start,
        end: start + totalWordLength(words),
    }
}

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

export function allWurds(words: string | string[]) {
    if (typeof words === 'string') return allWurds(splitSentence(words));

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

// print allWurds
// for (const chunk of result) {
//     console.info(chunk.wurd.join(' ').padStart(chunk.start + chunk.wurd.join(' ').length, ' '));
// }

// calculate valid combinations of wurds
function validCombinationsForClue(clue: string) {
    const clueWords = splitSentence(clue);
    const numWords = clueWords.length;
    const numSplitPositions = numWords - 1;
    const splitBinaryMask = new Array(numSplitPositions).fill(1).join('')
    const splitPositionsBinary = splitBinaryMask.length === 0 ? 0 : parseInt(splitBinaryMask, 2)
    const splits =
        new Array(splitPositionsBinary)
            .fill(null)
            .map((_, n) => n)
            .map(n => n.toString(2).padStart(numSplitPositions, '0'))
            .map(mask => mask.split(''))

    const acc = []
    for (const mask of splits) {
        const chunks: string[][] = []
        let currentChunk: string[] = [];
        for (let i = 0; i < numWords; i++) {
            const word = clueWords[i];
            currentChunk.push(word);

            const shouldSplitAfter = mask[i] === '1';
            if (shouldSplitAfter) {
                chunks.push(currentChunk);
                currentChunk = [];
            }
        }
        chunks.push(currentChunk);
        acc.push(chunks);
    }
    acc.push(clueWords.map(w => [w]))

    return acc;
}

// print all valid combos of wurds
// const combos = validCombinationsForClue(clue)
// combos.forEach(console.info)

let definition: string;
const define = (clue: string, part: string) => { definition = part; return clue.replace(new RegExp(`(^${part}|${part}$)`), '').trim() }
const synonym = (clue: string, part: string, replacement: string) => clue.replace(part, replacement).trim()
const reversal = (clue: string, part: string, whole: string) => clue.replace(whole, part.split('').reverse().join('')).trim()
const insertion = (clue: string, part: string, replacement: string) => synonym(clue, part, replacement);
let step = clue;
step = define(step, "Hamlet's");
step = synonym(step, "struggle", "VIE")
step = synonym(step, "bitterness", "GALL")
step = reversal(step, "GALL", "GALL back")
step = insertion(step, "VIE to hold LLAG", "VILLAGE")

console.info(definition! + " = " + step)