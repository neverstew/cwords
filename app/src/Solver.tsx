import { Header } from "./components/Header";
import { useGame } from "./useGame";
import { GameContextProvider } from "./useGameContext";

export const Solver = () => {
    const game = useGame();

    return (
        <GameContextProvider value={game}>
            <Header />
            <main>
                This is the solver
            </main>
        </GameContextProvider >
    );
}