/**
 * A range is between two points on a line.
 * `start` and `end` are INCLUSIVE
 */
export type Range = {
    start: number;
    end: number;
}
export type TypedRange = Range & {
    type: 'clue' | 'definition';
}

export function rangesOverlap(anchor: Range, other: Range) {
    return other.end >= anchor.start && other.start <= anchor.end;
}

export function overlapsBeginning(anchor: Range, other: Range) {
    return other.start <= anchor.start && other.end >= anchor.start;
}

export function overlapsEnd(anchor: Range, other: Range) {
    return other.start <= anchor.end && other.end >= anchor.end;
}

export function exactMatch(anchor: Range, other: Range) {
    return other.start === anchor.start && other.end === anchor.end;
}

export function consumesAnchor(anchor: Range, other: Range) {
    return other.start <= anchor.start && other.end >= anchor.end;
}

export function consumesOther(anchor: Range, other: Range) {
    return anchor.start <= other.start && anchor.end >= other.end;
}

export function stringRange(str: string, range: Range) {
    return str.slice(range.start, range.end + 1);
}

export function uniqueRanges<T extends Range>(ranges: T[]) {
    return Object.values(
        ranges
            .reduce((hash, range) => {
                hash[`${range.start}, ${range.end}`] = range;
                return hash
            }, {} as Record<string, T>)
    )
}