import clsx from 'clsx';
import { ChangeEventHandler, KeyboardEvent, PropsWithChildren, useEffect, useMemo, useRef } from 'react';
import './index.css';
import { GameState, useGame } from './useGame';
import { GameContextProvider, useGameContext } from "./useGameContext";

const App = () => {
  const game = useGame();
  const [state] = game;

  return (
    <GameContextProvider value={game}>
      <Header />
      <div className='flex-col md:grid grid-cols-2 py-2 min-w-64'>
        {state.complete ? (
          <div className="col-span-2 px-6 pt-2">
            <Celebration />
          </div>
        ) : null}
        <Main />
        <Aside />
      </div>
    </GameContextProvider>
  );
}

const Header = () => {
  const [state] = useGameContext();

  return (
    <header className="shadow-md flex items-stretch md:sticky md:top-0">
      <div className='hidden md:flex p-4 h-20 flex-col justify-center'>
        <h1>cwords</h1>
      </div>
      <div className='md:hidden grow'>
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

const Celebration = () => {
  return (
    <div className='rounded py-1 px-2 md:py-2 md:px-3 lg:py-3 lg:px-4 bg-green-200' role="alert">
      <p>
        🎉 Correct - well done!
      </p>
    </div>
  )
}

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
  const cellStartNums = useMemo(() =>
    new Array(25)
      .fill(null)
      .map((_, idx) =>
        Object.entries(state.words)
          .find(([_key, word]) => word.range[0] === idx)
          ?.[0].slice(1)
      )
    , [state.words]
  )

  return (
    <div className='relative max-w-72 sm:max-w-96 mx-auto'>
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
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    console.debug(e.key)

    if (e.metaKey) return;

    switch (e.key) {
      case 'Backspace':
        if (e.currentTarget.value === '') dispatch({ type: 'move-focus', idx, direction: 'previous' });
        return;
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

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const chars = e.target.value.trim().split('');
    if (chars.length === 0) {
      dispatch({ type: 'input-letter', idx, letter: '' });
      return
    }

    const finalChar = chars[chars.length - 1];
    if (!finalChar.match(/[a-zA-Z ]/)) return;

    dispatch({ type: 'input-letter', idx, letter: finalChar.trim() });
    dispatch({ type: 'move-focus', idx, direction: 'next' })
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
      onChange={onChange}
      onFocus={onFocus}
      className="border aspect-square text-2xl sm:text-3xl text-center bg-white bg-opacity-0"
    />
  );
};

const BlankCell = () => <div className="bg-black border aspect-square" />;

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

export default App
