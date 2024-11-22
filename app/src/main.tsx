import { StrictMode } from 'react'
import App from './App.tsx'
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { Solver } from './Solver.tsx';

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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
