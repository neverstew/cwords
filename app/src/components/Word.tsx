import clsx from "clsx";
import { GameState } from "../useGame";
import { useGameContext } from "../useGameContext";

export const Word = ({ id, word }: { id: keyof GameState['words']; word: GameState['words'][keyof GameState['words']]; }) => {
  const [state, dispatch] = useGameContext();
  const classes = clsx(
    id === state.selectedWord && "font-bold",
    state.words[id].range.map(i => state.letters[i]).every(char => char.match(/[a-zA-Z]/)) && "text-gray-400"
  );

  return (
    <div className={classes}>
      <h3 className='uppercase text-xs sm:text-sm md:text-md'>{id}</h3>
      <button className="text-start text-sm sm:text-md md:text-lg" onClick={() => dispatch({ type: 'select-word', key: id })}>{word.clue} {word.counts}</button>
    </div>
  );
};
