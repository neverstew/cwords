import { it, expect } from 'bun:test';
import { consumesAnchor, consumesOther, exactMatch, overlapsBeginning, overlapsEnd, Range, rangesOverlap } from './ranges';

let anchor: Range = { start: 10, end: 20 };

const cases = [
    // before anchor
    [anchor, { start: 0, end: 9 }, rangesOverlap, false],
    [anchor, { start: 0, end: 9 }, overlapsBeginning, false],
    [anchor, { start: 0, end: 9 }, overlapsEnd, false],
    // on anchor start
    [anchor, { start: 0, end: 10 }, rangesOverlap, true],
    [anchor, { start: 0, end: 10 }, overlapsBeginning, true],
    [anchor, { start: 0, end: 10 }, overlapsEnd, false],
    // overlapping beginning
    [anchor, { start: 0, end: 11 }, rangesOverlap, true],
    [anchor, { start: 0, end: 11 }, overlapsBeginning, true],
    [anchor, { start: 0, end: 11 }, overlapsEnd, false],
    // inside anchor, on start
    [anchor, { start: 10, end: 10 }, rangesOverlap, true],
    [anchor, { start: 10, end: 10 }, overlapsBeginning, true],
    [anchor, { start: 10, end: 10 }, overlapsEnd, false],
    [anchor, { start: 10, end: 12 }, rangesOverlap, true],
    [anchor, { start: 10, end: 12 }, overlapsBeginning, true],
    [anchor, { start: 10, end: 12 }, overlapsEnd, false],
    // inside anchor, after start
    [anchor, { start: 11, end: 12 }, rangesOverlap, true],
    [anchor, { start: 11, end: 12 }, overlapsBeginning, false],
    [anchor, { start: 11, end: 12 }, overlapsEnd, false],
    // inside anchor, on end
    [anchor, { start: 19, end: 20 }, rangesOverlap, true],
    [anchor, { start: 19, end: 20 }, overlapsBeginning, false],
    [anchor, { start: 19, end: 20 }, overlapsEnd, true],
    [anchor, { start: 20, end: 20 }, rangesOverlap, true],
    [anchor, { start: 20, end: 20 }, overlapsBeginning, false],
    [anchor, { start: 20, end: 20 }, overlapsEnd, true],
    // overlapping end
    [anchor, { start: 19, end: 21 }, rangesOverlap, true],
    [anchor, { start: 19, end: 21 }, overlapsBeginning, false],
    [anchor, { start: 19, end: 21 }, overlapsEnd, true],
    [anchor, { start: 20, end: 21 }, rangesOverlap, true],
    [anchor, { start: 20, end: 21 }, overlapsBeginning, false],
    [anchor, { start: 20, end: 21 }, overlapsEnd, true],
    // after end
    [anchor, { start: 21, end: 21 }, rangesOverlap, false],
    [anchor, { start: 21, end: 21 }, overlapsBeginning, false],
    [anchor, { start: 21, end: 21 }, overlapsEnd, false],

    // Special cases...
    // exact match
    [anchor, { start: 10, end: 20 }, exactMatch, true],
    [anchor, { start: 10, end: 19 }, exactMatch, false],
    // consumes anchor
    [anchor, { start: 10, end: 20 }, consumesAnchor, true],
    [anchor, { start: 9, end: 20 }, consumesAnchor, true],
    [anchor, { start: 10, end: 21 }, consumesAnchor, true],
    [anchor, { start: 9, end: 21 }, consumesAnchor, true],
    [anchor, { start: 9, end: 19 }, consumesAnchor, false],
    [anchor, { start: 11, end: 21 }, consumesAnchor, false],
    // consumes other (flip of consumesAnchor)
    [{ start: 10, end: 20 }, anchor, consumesOther, true],
    [{ start: 9, end: 20 }, anchor, consumesOther, true],
    [{ start: 10, end: 21 }, anchor, consumesOther, true],
    [{ start: 9, end: 21 }, anchor, consumesOther, true],
    [{ start: 9, end: 19 }, anchor, consumesOther, false],
    [{ start: 11, end: 21 }, anchor, consumesOther, false],
] as const

cases.map(([anchor, other, fn, result]) => {
    it(`running ${fn.name} on ${[anchor.start, anchor.end]} with ${[other.start, other.end]} should return ${result}`, () => {
        expect(fn(anchor, other)).toEqual(result);
    })
})
