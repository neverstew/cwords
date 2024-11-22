import { Link } from "react-router-dom";
import { Header } from "./components/Header";
import { useGameContext } from "./useGameContext";

export const Solver = () => {

    return (
        <>
            <Header />
            <Main />
        </>
    );
}

const Main = () => {
    const [state] = useGameContext();
    const selectedWord = state.selectedWord as keyof typeof state.words | undefined;

    if (!selectedWord) return (
        <main className="mx-auto p-6 max-w-md sticky top-0 bg-white space-y-8">
            <p>Select a clue from the <Link to="/">puzzle page</Link></p>
        </main>
    )
    
    const word = state.words[selectedWord];

    return (
        <main className="mx-auto p-6 max-w-md bg-white space-y-8">
            <p>{word.clue}</p>
        </main>
    )

}