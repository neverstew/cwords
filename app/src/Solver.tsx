import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";
import { Header } from "./components/Header";
import { consumesAnchor, consumesOther, exactMatch, overlapsBeginning, overlapsEnd, rangesOverlap, stringRange, uniqueRanges, type Range, type TypedRange } from "./ranges";
import { useGameContext } from "./useGameContext";
import { nodeId, SolutionTreeNode } from "./solutionTree";
import { Transformation, DefinitionTransformation, ReplacementTransformation, transform } from "./transformations";

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

const SolutionTree = ({ word }: { word: string }) => {
    const rootNode = useMemo<SolutionTreeNode>(() => ({
        id: nodeId(),
        children: [],
        clue: word,
        ranges: [{ start: 0, end: word.length - 1, type: 'clue' }],
        transformation: { type: 'clue' }
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
        const highlightRange: TypedRange = { start, end: endOffset - 1, type: node.transformation.type };
        const splitRanges =
            initialNode.ranges
                .flatMap(range => {
                    if (!rangesOverlap(range, highlightRange)) {
                        console.debug('ranges do not overlap', { ranges: initialNode.ranges, range, highlightRange });
                        return [range, highlightRange];
                    }
                    if (exactMatch(range, highlightRange)) {
                        console.debug('ranges match', { ranges: initialNode.ranges, range, highlightRange });
                        return [highlightRange];
                    }
                    if (overlapsBeginning(range, highlightRange)) {
                        console.debug('range split at start', { ranges: initialNode.ranges, range, highlightRange });
                        return [highlightRange, { start: highlightRange.end + 1, end: range.end, type: range.type }]
                    }
                    if (overlapsEnd(range, highlightRange)) {
                        console.debug('range split at end', { ranges: initialNode.ranges, range, highlightRange });
                        return [{ start: range.start, end: highlightRange.start - 1, type: range.type }, highlightRange]
                    }
                    if (consumesAnchor(range, highlightRange)) {
                        console.debug('range consumed', { ranges: initialNode.ranges, range, highlightRange });
                        return [highlightRange];
                    }
                    if (consumesOther(range, highlightRange)) {
                        console.debug('range split in three', { ranges: initialNode.ranges, range, highlightRange });
                        return [
                            { start: range.start, end: highlightRange.start - 1, type: range.type },
                            highlightRange,
                            { start: highlightRange.end + 1, end: range.end, type: range.type },
                        ]
                    }

                    console.error("Highlight range unhandled case", { ranges: initialNode.ranges, highlightRange });
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

    const handleSave = (transformation: Transformation) => {
        const transformed = transform(node, transformation);

        // create a new child
        const newSolutionNode: SolutionTreeNode = {
            id: nodeId(),
            parent: transformed,
            children: [],
            clue: transformed.clue, // adapt this later with transforms
            ranges: transformed.ranges,
            transformation: { type: 'clue' },
        }
        
        setNode(currentNode => ({
            ...currentNode,
            children: [...currentNode.children, newSolutionNode],
        }))
    }

    const handleTransformationChange = (transformation: Transformation) => setNode(current => ({ ...current, transformation }))

    return (
        <div className="border-l pl-2">
            <div className="font-mono">
                <pre id={node.id.toString()}>{node.clue}</pre>
                <pre>{node.ranges.map(range => <RangeSpan key={[range.start, range.end].join(',')} word={node.clue} range={range} />)}</pre>
            </div>
            {node.children.length === 0 ? (
                <>
                    <HighlightControls transformation={node.transformation} onTransformationChange={handleTransformationChange} onSave={handleSave} />
                    <pre>{JSON.stringify(node.ranges, null, 2)}</pre>
                </>
            ) : null}
            {node.children.map(child => <TreeNode key={node.clue} initialNode={child} />)}
        </div>
    )
}

const HighlightControls = ({ transformation, onTransformationChange, onSave }: { transformation: Transformation, onTransformationChange: (t: Transformation) => void, onSave: (transformation: Transformation) => void }) => {
    let controls;
    switch (transformation.type) {
        case 'definition':
            controls = <DefinitionHighlightControls key={transformation.type} transformation={transformation} onChange={onTransformationChange} />
            break;
        case 'replacement':
            controls = <ReplaceHighlightControls key={transformation.type} transformation={transformation} onChange={onTransformationChange} />
            break;
    }

    return (
        <div className="flex gap-2 items-baseline">
            {controls}
            <select name="type" id="type" value={transformation.type} onChange={(e) => onTransformationChange({ type: e.target.value as Transformation['type'] })}>
                {['definition', 'replacement'].map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <button onClick={() => onSave(transformation)}>Save</button>
        </div>
    )
}

const DefinitionHighlightControls = ({}: { transformation: DefinitionTransformation, onChange: (t: Transformation) => void }) => {
    return (
        <div className="flex gap-2 items-baseline">
            <span>Type: definition</span>
        </div>
    )
}

const ReplaceHighlightControls = ({ transformation, onChange }: { transformation: ReplacementTransformation, onChange: (t: Transformation) => void }) => {
    return (
        <div className="flex gap-2 items-baseline">
            <span>Type: replace</span>
            <input className="border" type="text" name="replacement" id="replacement" value={transformation.replacement} onChange={e => onChange({ type: 'replacement', replacement: e.target.value })} />
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
