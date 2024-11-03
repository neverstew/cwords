import { useReducer } from "react";

const puzzle = `
  p a p e r
  . . h . e
  . f o o d
  . . t . .
  a b o u t
`;

export const INITIAL_GAME_STATE = {
    puzzle,
    cells: puzzle.trim().split(/\s+/),
    letters: new Array(25).fill(''),
    words: {
        a1: {
            clue: "Money rag",
            range: [0, 1, 2, 3, 4],
        },
        a4: {
            clue: "Endless foot starts delicious nosh",
            range: [11, 12, 13, 14],
        },
        a5: {
            clue: "Fight a round here (or there?)",
            range: [20, 21, 22, 23, 24],
        },
        d2: {
            clue: "Pic of vietnamese noodle recipient",
            range: [2, 7, 12, 17, 22],
        },
        d3: {
            clue: "Richard's explicit diagram began as one colour",
            range: [4, 9, 14],
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

export type Dispatch = (state: GameState, action: GameAction) => GameState;
const reducer: Dispatch = (state, action) => {
    console.debug(action.type, action);

    if (action.type === "input-letter") {
        const letters = [...state.letters];
        letters[action.idx] = action.letter;
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
    return state;
}

export const useGame = () => {
    return useReducer(reducer, INITIAL_GAME_STATE)
}
