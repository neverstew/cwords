import { TypedRange } from "./ranges";

export type SolverState = {
    originalClue: string;
    solutionTree: SolutionTreeNode;
    currentSolutionNode: SolutionTreeNode;
}

export type SolutionTreeNode = {
    id: number;
    parent?: SolutionTreeNode;
    children: SolutionTreeNode[];
    clue: string;
    ranges: TypedRange[];
}

function *genId() {
    let id = new Date().getTime();
    while (true) {
        yield id;
        id++;
    }
}
const idGenerator = genId();
export const nodeId = () => idGenerator.next().value!;
