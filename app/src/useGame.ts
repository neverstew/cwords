import { useEffect, useReducer } from "react";

const puzzle = `
c a s e s
o . h . i
l e a s t
o . l . e
r u l e s
`;

export const INITIAL_GAME_STATE = {
    puzzle,
    cells: puzzle.trim().split(/\s+/).map(c => c.toUpperCase()),
    letters: new Array(25).fill(''),
    words: {
        a1: {
            clue: "Wine boxes found in gutted castles",
            range: [0, 1, 2, 3, 4],
            counts: '(5)',
        },
        a4: {
            clue: "Returning, gutted castle's remains enclose tumultuous sea at lowest point",
            range: [10, 11, 12, 13, 14],
            counts: '(5)',
        },
        a5: {
            clue: "Leaders, without a right, make laws",
            range: [20, 21, 22, 23, 24],
            counts: '(5)',
        },
        d1: {
            clue: "Dog's accessory: less LA, more first outing - that's shade.",
            range: [0, 5, 10, 15, 20],
            counts: '(5)',
        },
        d2: {
            clue: "Rotating large gathering rooms will exist in the future",
            range: [2, 7, 12, 17, 22],
            counts: '(5)',
        },
        d3: {
            clue: "Hears references to locations",
            range: [4, 9, 14, 19, 24],
            counts: '(5)',
        }
    },
    selectedInput: 0,
    selectedWord: undefined as undefined | string,
    selectedWordDirection: 'across' as 'across' | 'down',
};
export type GameState = typeof INITIAL_GAME_STATE;
export type GameAction =
    { type: 'input-letter', idx: number; letter: string; }
    | { type: 'input-focused', idx: number }
    | { type: 'move-focus', idx: number; direction: 'up' | 'right' | 'down' | 'left' | 'next' | 'previous' }
    | { type: 'select-word', key: string }
    | { type: 'select-relative-word', direction: 'next' | 'previous' }

export type Dispatch = (state: GameState, action: GameAction) => GameState;
const reducer: Dispatch = (state, action) => {
    console.debug(action.type, action);

    if (action.type === "input-letter") {
        const letters = [...state.letters];
        letters[action.idx] = action.letter.toUpperCase();
        return {
            ...state,
            letters,
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
