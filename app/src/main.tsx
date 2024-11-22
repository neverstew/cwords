import { StrictMode } from 'react'
import App from './App.tsx'
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { Solver } from './Solver.tsx';
import { GameContextProvider } from './useGameContext.ts';
import { useGame } from './useGame.ts';

const router = createBrowserRouter([
  {
    path: "/solver",
    element: <Solver />,
  },
  {
    path: "/",
    element: <App />,
  },
]);

const ContextualisedApp = () => {
  const game = useGame()
  return (
    <GameContextProvider value={game}>
      <RouterProvider router={router} />
    </GameContextProvider>
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ContextualisedApp />
  </StrictMode>
);
