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
        d2: {
            clue: "Pic of vietnamese noodle recipient",
            range: [2, 7, 12, 17, 22],
        },
    },
    selectedInput: 0,
};
export type GameState = typeof INITIAL_GAME_STATE;
export type GameAction =
    { type: 'input-letter', idx: number; letter: string; }
    | { type: 'input-focused', idx: number }
    | { type: 'move-focus', idx: number; direction: 'up' | 'right' | 'down' | 'left' }

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
        return {
            ...state,
            selectedInput: action.idx,
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
        }
        return {
            ...state,
            selectedInput,
        };
    }
    return state;
}

export const useGame = () => {
    return useReducer(reducer, INITIAL_GAME_STATE)
}
