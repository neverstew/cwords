import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";
import { Header } from "./components/Header";
import { consumesAnchor, consumesOther, exactMatch, overlapsBeginning, overlapsEnd, rangesOverlap, stringRange, uniqueRanges, type Range, type TypedRange } from "./ranges";
import { GameState } from "./useGame";
import { useGameContext } from "./useGameContext";
import { nodeId, SolutionTreeNode } from "./useSolver";

export const Solver = () => {
    return (
        <>
            <Header />
            <Main />
        </>
    );
}

const Main = () => {
    return (
        <main className="mx-auto p-6 max-w-md bg-white space-y-8">
            <WorkingArea />
        </main>
    )
}

const WorkingArea = () => {
    const [state] = useGameContext();

    const selectedWord = state.selectedWord as keyof typeof state.words | undefined;

    if (!selectedWord) return (
        <main className="mx-auto p-6 max-w-md sticky top-0 bg-white space-y-8">
            <p>Select a clue from the <Link to="/">puzzle page</Link></p>
        </main>
    )

    const word = state.words[selectedWord];
    return <SolutionTree word={word.clue} />
}

type Transformation = {
    type: "definition";
    definition: string;
}

const Annotator = ({ word }: { word: GameState["words"][keyof GameState['words']] }) => {
    const [state, setState] = useState<any>({});
    const [selection, setSelection] = useState<Selection | null>(null);
    const [steps, setSteps] = useState<AnnotatorStep[]>([
        { clue: word.clue },
    ])
    const addStep = (newStep: AnnotatorStep) => setSteps(current => {
        const last = current.pop()!;
        last.highlightRange = [state.start, state.end];
        return [...current, last, newStep];
    });
    const [transformation, setTransformation] = useState<Transformation>({ type: 'definition', definition: '' });

    const applyTransformation = () => {
        const finalStep = steps[steps.length - 1];
        const clue = finalStep.clue;
        const beforeSelection = clue.slice(0, state.start);
        const duringSelection = clue.slice(state.start, state.end);
        const afterSelection = clue.slice(state.end);
        const newClue = [
            beforeSelection,
            transformation.definition,
            afterSelection,
        ].map(s => s.trim()).join(' ')
        addStep({ clue: newClue })
    }

    const handleSelectionChange = (selection: Selection) => {
        setSelection(selection);
        const {
            anchorNode,
            anchorOffset,
            direction,
            focusNode,
            focusOffset,
            isCollapsed,
            rangeCount,
            type,
        } = selection;

        if (type === "Caret") return;
        if (isCollapsed) return;

        const start = Math.min(anchorOffset, focusOffset);
        const end = Math.max(anchorOffset, focusOffset);
        setState({
            start,
            end
        });
    }

    useEffect(() => {
        const listener = () => {
            const selection = document.getSelection();
            if (!selection) return;
            handleSelectionChange(selection);
        }
        document.addEventListener('selectionchange', listener);
        return () => removeEventListener('selectionchange', listener);
    }, []);

    return (
        <div className="flex flex-col gap-4 items-start">
            {steps.map((step, i) => <AnnotatorStep {...step} key={i} />)}
            <div className="flex gap-2 items-baseline">
                <span>Type: {transformation.type}</span>
                <input className="border" type="text" name="definition" id="definition" value={transformation.definition} onChange={e => setTransformation(current => ({ ...current, definition: e.target.value }))} />
                <button onClick={applyTransformation}>Save</button>
            </div>
            <pre>{JSON.stringify(state, null, 2)}</pre>
        </div>
    )
}

type AnnotatorStep = {
    clue: string;
    highlightRange?: [number, number];
}
const AnnotatorStep = ({ clue, highlightRange }: AnnotatorStep) => {
    let beforeSelection = null;
    let duringSelection = <span>{clue}</span>;
    let afterSelection = null;
    if (highlightRange) {
        beforeSelection = <>{clue.slice(0, highlightRange[0])}</>;
        duringSelection = <u>{clue.slice(highlightRange[0], highlightRange[1])}</u>;
        afterSelection = <>{clue.slice(highlightRange[1])}</>;
    }

    return (
        <div className="font-mono">
            {beforeSelection}
            {duringSelection}
            {afterSelection}
        </div>
    );
}

const SolutionTree = ({ word }: { word: string }) => {
    const rootNode = useMemo<SolutionTreeNode>(() => ({
        id: nodeId(),
        children: [],
        clue: word,
        ranges: [{ start: 0, end: word.length - 1, type: 'clue' }]
    }), [word])

    return (
        <div className="space-y-8">
            <TreeNode initialNode={rootNode} />
        </div>
    )
}

const TreeNode = ({ initialNode }: { initialNode: SolutionTreeNode }) => {
    const [node, setNode] = useState(initialNode);

    const listener = useCallback(() => {
        const selection = document.getSelection();
        if (!selection) return;
        if (selection.isCollapsed) return;
        if (selection.anchorNode?.parentElement?.id !== node.id.toString()) return;

        const { startOffset: start, endOffset } = selection.getRangeAt(0);
        const highlightRange: TypedRange = { start, end: endOffset - 1, type: 'definition' };
        const splitRanges =
            node.ranges
                .flatMap(range => {
                    if (!rangesOverlap(range, highlightRange)) {
                        console.debug('ranges do not overlap', { ranges: node.ranges, range, highlightRange });
                        return [range, highlightRange];
                    }
                    if (exactMatch(range, highlightRange)) {
                        console.debug('ranges match', { ranges: node.ranges, range, highlightRange });
                        return [highlightRange];
                    }
                    if (overlapsBeginning(range, highlightRange)) {
                        console.debug('range split at start', { ranges: node.ranges, range, highlightRange });
                        return [highlightRange, { start: highlightRange.end + 1, end: range.end, type: range.type }]
                    }
                    if (overlapsEnd(range, highlightRange)) {
                        console.debug('range split at end', { ranges: node.ranges, range, highlightRange });
                        return [{ start: range.start, end: highlightRange.start - 1, type: range.type }, highlightRange]
                    }
                    if (consumesAnchor(range, highlightRange)) {
                        console.debug('range consumed', { ranges: node.ranges, range, highlightRange });
                        return [highlightRange];
                    }
                    if (consumesOther(range, highlightRange)) {
                        console.debug('range split in three', { ranges: node.ranges, range, highlightRange });
                        return [
                            { start: range.start, end: highlightRange.start - 1, type: range.type },
                            highlightRange,
                            { start: highlightRange.end + 1, end: range.end, type: range.type },
                        ]
                    }

                    console.error("Highlight range unhandled case", { ranges: node.ranges, highlightRange });
                    return range;
                })

        const newRanges: TypedRange[] = uniqueRanges(
            splitRanges
                .sort((a, b) => a.start - b.start)
                .filter(range => range.end - range.start >= 0)
        );

        setNode(currentNode => ({ ...currentNode, ranges: newRanges }));
    }, [node]);

    const debouncedListener = useDebouncedCallback(listener, 250, { trailing: true });

    useEffect(() => {
        document.addEventListener('selectionchange', debouncedListener);
        return () => removeEventListener('selectionchange', debouncedListener);
    }, [debouncedListener]);

    const handleSave = () => {
        // create a new child
        const newSolutionNode: SolutionTreeNode = {
            id: nodeId(),
            parent: node,
            children: [],
            clue: node.clue, // adapt this later with transforms
            ranges: node.ranges,
        }
        setNode(currentNode => ({
            ...currentNode,
            children: [...currentNode.children, newSolutionNode],
        }))
    }

    return (
        <div className="border-l pl-2">
            <div className="font-mono">
                <pre id={node.id.toString()}>{node.clue}</pre>
                <pre>{node.ranges.map(range => <RangeSpan key={[range.start, range.end].join(',')} word={node.clue} range={range} />)}</pre>
            </div>
            {node.children.length === 0 ? (
                <>
                    <button onClick={handleSave} className="border p-1">Save</button>
                    <pre>{JSON.stringify(node.ranges, null, 2)}</pre>
                </>
            ) : null}
            {node.children.map(child => <TreeNode key={node.clue} initialNode={child} />)}
        </div>
    )
}

const RangeSpan = ({ word, range }: { word: string, range: Range }) => {
    const chars = stringRange(word, range);
    const underlineColour = colourGenerator.next();
    return <span className={`underline ${underlineColour.value}`}>{chars.split('').map(() => ' ').join('')}</span>
}

const colours = ["decoration-red-300", "decoration-amber-300", "decoration-lime-300", "decoration-emerald-300", "decoration-cyan-300", "decoration-indigo-300",]
function* nextColour() {
    let i = 0;
    while (true) {
        yield colours[i];
        i = (i + 1) % colours.length;
    }
}
const colourGenerator = nextColour();