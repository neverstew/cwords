import clsx from 'clsx';
import { KeyboardEvent, PropsWithChildren, useEffect, useRef } from 'react';
import { GameState, useGame } from './useGame';
import { GameContextProvider, useGameContext } from "./useGameContext";

const App = () => {
  const game = useGame();

  return (
    <GameContextProvider value={game}>
      <Header />
      <div className='flex-col md:grid grid-cols-2 py-2 min-w-64'>
        <Main />
        <Aside />
      </div>
    </GameContextProvider>
  );
}

const Header = () => {
  const [state] = useGameContext();

  return (
    <header className="h-20 shadow-md flex items-center md:sticky md:top-0">
      <div className='hidden md:block p-4'>
        <h1>cwords</h1>
      </div>
      <div className='md:hidden p-2 grow'>
        {
          state.selectedWord
            ? <SelectedWord />
            : <h1>cwords</h1>
        }
      </div>
    </header>
  )
};

const Main = () => (
  <main className="mx-auto p-6 max-w-md sticky top-0 bg-white">
    <Crossword />
  </main>
);

const Aside = () => (
  <aside className='p-6 hidden [@media(min-height:500px)]:block'>
    <nav className='space-y-2'>
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
      <h3 className='uppercase text-xs sm:text-sm md:text-md'>{id}</h3>
      <button className="text-start text-sm sm:text-md md:text-lg" onClick={() => dispatch({ type: 'select-word', key: id })}>{word.clue} {word.counts}</button>
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
      <div className="w-full absolute top-0 left-0 grid grid-cols-5 grid-rows-5 -z-10">
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
      className={clsx("aspect-square px-1", selected ? "bg-yellow-100" : null)}
    >
      {children}
    </span>
  )
}

const Cell = ({ idx }: { idx: number }) => {
  const [state, dispatch] = useGameContext();
  const ref = useRef<HTMLInputElement>(null);

  const onFocus = () => dispatch({ type: 'input-focused', idx })
  const onKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    console.debug(e.key)

    if (e.metaKey) return;

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
      onKeyUp={onKeyUp}
      onFocus={onFocus}
      className="border aspect-square text-3xl text-center bg-white bg-opacity-0"
    />
  );
};

const BlankCell = () => <div className="bg-black border aspect-square" />;

const SelectedWord = () => {
  const [state, dispatch] = useGameContext();

  if (!state.selectedWord) return null;
  const word = state.words[state.selectedWord as keyof typeof state.words];

  return (
    <div className="flex-col">
      <Word id={state.selectedWord as keyof typeof state.words} word={word} />
      <div className="flex justify-between gap-4">
        <button onClick={() => dispatch({ type: 'select-relative-word', direction: 'previous' })} className="text-start text-sm sm:text-md md:text-lg">{'<'} prev</button>
        <button onClick={() => dispatch({ type: 'select-relative-word', direction: 'next' })} className="text-start text-sm sm:text-md md:text-lg">next {'>'}</button>
      </div>
    </div>
  )
}

export default App
