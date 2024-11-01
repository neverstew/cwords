import { createContext, useContext } from "react";
import { GameState, GameAction, INITIAL_GAME_STATE } from "./useGame";

const gameContext = createContext<[GameState, React.Dispatch<GameAction>]>([INITIAL_GAME_STATE, () => INITIAL_GAME_STATE]);
export const GameContextProvider = gameContext.Provider;
export const useGameContext = () => useContext(gameContext);
