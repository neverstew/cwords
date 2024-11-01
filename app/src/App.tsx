import clsx from 'clsx';
import { KeyboardEvent, useEffect, useRef } from 'react';
import { useGame } from './useGame';
import { GameContextProvider, useGameContext } from "./useGameContext";

const App = () => {
  const game = useGame();

  return (
    <GameContextProvider value={game}>
      <Header />
      <Main />
    </GameContextProvider>
  );
}

const Header = () => (
  <header className="h-20 shadow-md p-4 flex items-center">
    <h1>cwords</h1>
  </header>
);

const Main = () => (
  <main className="mx-auto p-6 max-w-md">
    <Crossword />
  </main>
);


const Crossword = () => {
  const [state] = useGameContext();

  return (
    <div className="grid grid-cols-5 grid-rows-5">
      {state.cells.map((_, i) => <Cell key={i} idx={i} />)}
    </div>
  );
};

const Cell = ({ idx }: { idx: number }) => {
  const [state, dispatch] = useGameContext();
  const ref = useRef<HTMLInputElement>(null);

  const onFocus = () => dispatch({ type: 'input-focused', idx })
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    console.debug(e.key)

    switch (e.key) {
      case 'a':
      case 'b':
      case 'c':
      case 'd':
      case 'e':
      case 'f':
      case 'g':
      case 'h':
      case 'i':
      case 'j':
      case 'k':
      case 'l':
      case 'm':
      case 'n':
      case 'o':
      case 'p':
      case 'q':
      case 'r':
      case 's':
      case 't':
      case 'u':
      case 'v':
      case 'w':
      case 'x':
      case 'y':
      case 'z':
      case 'A':
      case 'B':
      case 'C':
      case 'D':
      case 'E':
      case 'F':
      case 'G':
      case 'H':
      case 'I':
      case 'J':
      case 'K':
      case 'L':
      case 'M':
      case 'N':
      case 'O':
      case 'P':
      case 'Q':
      case 'R':
      case 'S':
      case 'T':
      case 'U':
      case 'V':
      case 'W':
      case 'X':
      case 'Y':
      case 'Z':
        dispatch({ type: 'input-letter', idx, letter: e.key });
        dispatch({ type: 'move-focus', idx, direction: 'right' })
        return;
      case 'Backspace':
        dispatch({ type: 'input-letter', idx, letter: '' });
        dispatch({ type: 'move-focus', idx, direction: 'left' })
        return
      case ' ':
      case 'Space':
        dispatch({ type: 'input-letter', idx, letter: '' });
        dispatch({ type: 'move-focus', idx, direction: 'right' })
        return
      case 'ArrowLeft':
        dispatch({ type: 'move-focus', idx, direction: 'left' })
        return;
      case 'ArrowRight':
        dispatch({ type: 'move-focus', idx, direction: 'right' })
        return;
      case 'ArrowUp':
        dispatch({ type: 'move-focus', idx, direction: 'up' })
        return;
      case 'ArrowDown':
        dispatch({ type: 'move-focus', idx, direction: 'down' })
        return;
      default:
        return;
    }
  }

  useEffect(() => {
    if (state.selectedInput === idx) ref.current?.focus();
  }, [state.selectedInput])

  const answer = state.cells[idx];
  const letter = state.letters[idx];
  const correct = answer === letter;

  if (answer === ".")
    return <BlankCell />;

  return (
    <input
      ref={ref}
      value={letter}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      className={clsx("border aspect-square text-3xl text-center", correct && "bg-green-100")}
    />
  );
};

const BlankCell = () => <div className="bg-black border aspect-square" />;

export default App
