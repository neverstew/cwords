import clsx from 'clsx';
import { KeyboardEvent, PropsWithChildren, useEffect, useRef } from 'react';
import { GameState, useGame } from './useGame';
import { GameContextProvider, useGameContext } from "./useGameContext";

const App = () => {
  const game = useGame();

  return (
    <GameContextProvider value={game}>
      <Header />
      <div className='flex md:grid grid-cols-2'>
        <Main />
        <Aside />
      </div>
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

const Aside = () => (
  <aside className='p-6'>
    <nav>
      <Words />
    </nav>
  </aside>
)

const Words = () => {
  const [state] = useGameContext();

  return (
    <>
      {Object.entries(state.words).map(([key, word]) => (
        <Word key={key} id={key as keyof GameState['words']} word={word} />
      ))}
    </>
  )
}

const Word = ({ id, word }: { id: keyof GameState['words'], word: GameState['words'][keyof GameState['words']] }) => {
  const [state, dispatch] = useGameContext();
  const classes = clsx(
    id === state.selectedWord && "font-bold",
    state.words[id].range.map(i => state.letters[i]).every(char => char.match(/[a-zA-Z]/)) && "text-gray-400",
  );

  return (
    <div className={classes}>
      {id}: <button onClick={() => dispatch({ type: 'select-word', key: id })}>{word.clue}</button>
    </div>
  )
}

const Crossword = () => {
  const [state] = useGameContext();
  const cellStartNums =
    new Array(25)
      .fill(null)
      .map((_, idx) =>
        Object.entries(state.words)
          .find(([_key, word]) => word.range[0] === idx)
          ?.[0].slice(1)
      )

  return (
    <div className='relative'>
      <div className="absolute top-0 left-0 grid grid-cols-5 grid-rows-5 -z-10">
        {cellStartNums.map((num, idx) => <CellBackground idx={idx}>{num}</CellBackground>)}
      </div>
      <div className="grid grid-cols-5 grid-rows-5">
        {state.cells.map((_, i) => <Cell key={i} idx={i} />)}
      </div>
    </div>
  );
};

const CellBackground = ({ idx, children }: PropsWithChildren<{ idx: number }>) => {
  const [state] = useGameContext();
  const selected = !!state.selectedWord && state.words[state.selectedWord as keyof typeof state.words].range.includes(idx);

  return (
    <span
      className={clsx("aspect-square h-20 px-1", selected ? "bg-yellow-100" : null)}
    >
      {children}
    </span>
  )
}

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
        dispatch({ type: 'move-focus', idx, direction: 'next' })
        return;
      case 'Backspace':
        dispatch({ type: 'input-letter', idx, letter: '' });
        dispatch({ type: 'move-focus', idx, direction: 'previous' })
        return
      case ' ':
      case 'Space':
        dispatch({ type: 'input-letter', idx, letter: '' });
        dispatch({ type: 'move-focus', idx, direction: 'next' })
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
      case 'Tab':
        const direction = e.shiftKey ? 'previous' : 'next';
        dispatch({ type: 'move-focus', idx, direction })
        e.preventDefault();
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

  if (answer === ".")
    return <BlankCell />;

  return (
    <input
      ref={ref}
      value={letter}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      className="border aspect-square text-3xl text-center bg-white bg-opacity-0"
    />
  );
};

const BlankCell = () => <div className="bg-black border aspect-square" />;

export default App
