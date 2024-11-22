import { Link } from "react-router-dom";
import { useGameContext } from "../useGameContext";
import { Word } from "./Word";

export const Header = () => {
  const [state] = useGameContext();

  return (
    <header className="shadow-md flex items-stretch md:sticky md:top-0">
      <div className='hidden md:flex h-20 flex-col justify-center'>
        <Title />
      </div>
      <Link to="/solver" className="self-center">Solve</Link>
      <div className='md:hidden grow'>
        {state.selectedWord
          ? (
            <div>
              <SelectedWord />
            </div>
          )
          : <Title />}
      </div>
    </header>
  );
};

const Title = () => <Link to="/" className='p-4'><h1>cwords</h1></Link>

const SelectedWord = () => {
  const [state, dispatch] = useGameContext();

  if (!state.selectedWord) return null;
  const word = state.words[state.selectedWord as keyof typeof state.words];

  return (
    <div className="p-2 flex-col bg-yellow-100">
      <Word id={state.selectedWord as keyof typeof state.words} word={word} />
      <div className="flex justify-between gap-4">
        <button onClick={() => dispatch({ type: 'select-relative-word', direction: 'previous' })} className="px-1 text-start text-sm sm:text-md md:text-lg bg-white border-2 border-gray-200">{'<'} prev</button>
        <button onClick={() => dispatch({ type: 'select-relative-word', direction: 'next' })} className="px-1 text-start text-sm sm:text-md md:text-lg bg-white border-2 border-gray-200">next {'>'}</button>
      </div>
    </div>
  )
}
