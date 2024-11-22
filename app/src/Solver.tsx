import { Header } from "./components/Header";
import { Word } from "./components/Word";
import { useGameContext } from "./useGameContext";

export const Solver = () => {
    const [state] = useGameContext();

    return (
        <>
            <Header />
            <main>
                <Word id={state.selectedWord as keyof typeof state.words} word={state.words[state.selectedWord as keyof typeof state.words]} />
            </main>
        </ >
    );
}