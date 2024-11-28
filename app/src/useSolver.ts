import { TypedRange } from "./ranges";

export type SolverState = {
    originalClue: string;
    solutionTree: SolutionTreeNode;
    currentSolutionNode: SolutionTreeNode;
}

export type SolutionTreeNode = {
    parent?: SolutionTreeNode;
    children: SolutionTreeNode[];
    clue: string;
    ranges: TypedRange[];
}
