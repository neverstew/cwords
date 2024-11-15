import { useEffect, useReducer } from "react";

const puzzle = ". g . h .\nr a t e s\n. m . a .\ny e a r s\n. r . t .";
export const INITIAL_GAME_STATE = {
    puzzle,
    "words": {
        "a3": {
            "clue": "Mortgage interest produces crazy eyes",
            "range": [
                5,
                6,
                7,
                8,
                9
            ],
            "counts": "(5)"
        },
        "a4": {
            "clue": "Yes, evil aliens risk starting initial trips around the sun",
            "range": [
                15,
                16,
                17,
                18,
                19
            ],
            "counts": "(5)"
        },
        "d1": {
            "clue": "Equipment holds first medal for olympics contestant",
            "range": [
                1,
                6,
                11,
                16,
                21
            ],
            "counts": "(5)"
        },
        "d2": {
            "clue": "Instagram like gets the blood pumping",
            "range": [
                3,
                8,
                13,
                18,
                23
            ],
            "counts": "(5)"
        }
    },
    cells: puzzle.trim().split(/\s+/).map(c => c.toUpperCase()),
    letters: new Array(25).fill(''),
    selectedInput: 0,
    selectedWord: undefined as undefined | string,
    selectedWordDirection: 'across' as 'across' | 'down',
    complete: false,
    view: 'grid' as 'grid' | 'clue',
};

export type GameState = typeof INITIAL_GAME_STATE;
export type GameAction =
    { type: 'input-letter', idx: number; letter: string; }
    | { type: 'input-focused', idx: number }
    | { type: 'move-focus', idx: number; direction: 'up' | 'right' | 'down' | 'left' | 'next' | 'previous' }
    | { type: 'select-word', key: string }
    | { type: 'select-relative-word', direction: 'next' | 'previous' }
    | { type: 'change-view', view: GameState['view'] }

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
                : Object.entries(state.words).find(([_key, word]) => word.range.includes(action.idx));
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
    return state;
}

export const useGame = () => {
    let storedState: typeof INITIAL_GAME_STATE;
    try {
        const parsedState = JSON.parse(window.localStorage.getItem('state')!) as typeof INITIAL_GAME_STATE
        if (parsedState.puzzle !== INITIAL_GAME_STATE.puzzle) throw "New game";
        storedState = parsedState || INITIAL_GAME_STATE;
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
