import { Link, useAsyncError } from "react-router-dom";
import { Header } from "./components/Header";
import { useGameContext } from "./useGameContext";
import { AnnotateTag, TextAnnotate } from "react-text-annotate-blend";
import { GameState } from "./useGame";
import { useEffect, useRef, useState } from "react";

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
    return <Annotator word={word} />
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
    const addStep = (step: AnnotatorStep) => setSteps(current => [...current, step]);
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
        ].map(s => s.trim()).join(' ');
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
}
const AnnotatorStep = ({ clue }: AnnotatorStep) => {
    return <span>{clue}</span>
}