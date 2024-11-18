import { useEffect, useReducer } from "react";

const puzzle = "b i g . .\n. n . h .\no f t e n\n. o . r .\n. . k e y";
export const INITIAL_GAME_STATE = {
    puzzle, 
    "words": {
        "a1": {
            "clue": "Enormous pig with upside down head",
            "range": [
                0,
                1,
                2
            ],
            "counts": "(3)"
        },
        "a4": {
            "clue": "Western sonnet for secret is repetitive",
            "range": [
                10,
                11,
                12,
                13,
                14
            ],
            "counts": "(5)"
        },
        "a5": {
            "clue": "Dial tones in harmony",
            "range": [
                22,
                23,
                24
            ],
            "counts": "(3)"
        },
        "d2": {
            "clue": "This just in: Alex Jones' platform losing battles",
            "range": [
                1,
                6,
                11,
                16
            ],
            "counts": "(4)"
        },
        "d3": {
            "clue": "That's my point - hear hear!",
            "range": [
                8,
                13,
                18,
                23
            ],
            "counts": "(4)"
        }
    },
    cells: puzzle.trim().split(/\s+/).map(c => c.toUpperCase()),
    letters: new Array(25).fill(''),
    selectedInput: 0,
    selectedWord: undefined as undefined | string,
    selectedWordDirection: 'across' as 'across' | 'down',
    complete: false,
    view: 'grid' as 'grid' | 'clue',
    notes: {} as Record<string, string>,
};

export type GameState = typeof INITIAL_GAME_STATE;
export type GameAction =
    { type: 'input-letter', idx: number; letter: string; }
    | { type: 'input-focused', idx: number }
    | { type: 'move-focus', idx: number; direction: 'up' | 'right' | 'down' | 'left' | 'next' | 'previous' }
    | { type: 'select-word', key: string }
    | { type: 'select-relative-word', direction: 'next' | 'previous' }
    | { type: 'change-view', view: GameState['view'] }
    | { type: 'change-notes', notes: GameState['notes'][string] }

export type Dispatch = (state: GameState, action: GameAction) => GameState;
const reducer: Dispatch = (state, action) => {
    console.debug(action.type, action);

    if (action.type === "input-letter") {
        const letters = [...state.letters];
        letters[action.idx] = action.letter.toUpperCase();

        const complete = letters
            .map((l, i) => {
                if (state.cells[i] === '.') return l === '';
                return l === state.cells[i];
            })
            .every(result => Boolean(result));

        return {
            ...state,
            letters,
            complete,
        }
    }
    if (action.type === 'input-focused') {
        const word = state.words[state.selectedWord as keyof typeof state.words];
        const selectedWordKeyValue =
            word && word.range.includes(action.idx)
                ? [state.selectedWord!, word] as const
                : findMatchingWord(state, action.idx);
        return {
            ...state,
            selectedInput: action.idx,
            selectedWord: selectedWordKeyValue && selectedWordKeyValue[0],
            selectedWordDirection: selectedWordKeyValue && selectedWordKeyValue[1].range[1] - selectedWordKeyValue[1].range[0] === 1 ? 'across' : 'down',
        }
    }
    if (action.type === 'move-focus') {
        let selectedInput = action.idx;
        if (action.direction === 'left') {
            selectedInput -= 1;
        } else if (action.direction === 'right') {
            selectedInput += 1;
        } else if (action.direction === 'up') {
            selectedInput -= 5;
        } else if (action.direction === 'down') {
            selectedInput += 5;
        } else if (action.direction === 'next') {
            selectedInput += state.selectedWordDirection === 'across' ? 1 : 5;
        } else if (action.direction === 'previous') {
            selectedInput -= state.selectedWordDirection === 'across' ? 1 : 5;
        }
        return {
            ...state,
            selectedInput,
        };
    }
    if (action.type === 'select-word') {
        if (!(action.key in state.words)) return state;

        if (action.key === state.selectedWord) {
            return {
                ...state,
                selectedWord: undefined,
            }
        }

        const word = state.words[action.key as keyof typeof state.words];
        const selectedInput = word.range[0];
        const selectedWordDirection = word.range[1] - word.range[0] === 1 ? 'across' : 'down';
        return {
            ...state,
            selectedWord: action.key,
            selectedInput,
            selectedWordDirection,
        }
    }
    if (action.type === 'select-relative-word') {
        if (!state.selectedWord) return state
        const thisWordIdx = Object.keys(state.words).indexOf(state.selectedWord);
        const selectedWordIdx = thisWordIdx + (action.direction === 'next' ? 1 : -1);
        const selectedWord = Object.keys(state.words)[selectedWordIdx]
        if (!selectedWord) return state;

        const word = state.words[selectedWord as keyof typeof state.words];
        const selectedInput = word.range[0];
        const selectedWordDirection = word.range[1] - word.range[0] === 1 ? 'across' : 'down';

        return {
            ...state,
            selectedWord,
            selectedInput,
            selectedWordDirection,
        }
    }
    if (action.type === 'change-view') {
        return {
            ...state,
            view: action.view,
        }
    }
    if (action.type === 'change-notes') {
        const notes = { ...state.notes };
        notes[state.selectedWord as keyof typeof state.words] = action.notes;
        console.debug(notes);
        return {
            ...state,
            notes,
        }
    }
    return state;
}

export const useGame = () => {
    let storedState: GameState;
    try {
        const parsedState = JSON.parse(window.localStorage.getItem('state')!) as GameState
        if (parsedState.puzzle !== INITIAL_GAME_STATE.puzzle) throw "New game";

        if (!wordsMatch(parsedState.words, INITIAL_GAME_STATE.words)) {
            storedState = parsedState;
            storedState.words = INITIAL_GAME_STATE.words;
            storedState.selectedWord = undefined;
            storedState.selectedInput = 0;
        } else {
            storedState = parsedState || INITIAL_GAME_STATE;
        }

        if (!notesMatch(parsedState.notes, INITIAL_GAME_STATE.notes)) {
            storedState.notes = parsedState.notes || INITIAL_GAME_STATE.notes;
        }
    } catch {
        storedState = INITIAL_GAME_STATE;
    }

    const game = useReducer(reducer, storedState);

    const [state] = game;
    useEffect(() => {
        window.localStorage.setItem('state', JSON.stringify(state))
    }, [state])

    return game;
}

const wordsMatch = (a: GameState['words'], b: GameState['words']) => {
    return JSON.stringify(a) === JSON.stringify(b);
}

const notesMatch = (a: GameState['notes'], b: GameState['notes']) => {
    return JSON.stringify(a) === JSON.stringify(b);
}

const findMatchingWord = (state: GameState, letterIndex: number) => {
    const matching = Object.entries(state.words).find(([_key, word]) => word.range[0] === letterIndex);
    if (matching) return matching;

    return Object.entries(state.words).find(([_key, word]) => word.range.includes(letterIndex));
}