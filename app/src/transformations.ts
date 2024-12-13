import { SolutionTreeNode } from "./solutionTree";


export type ClueTransformation = { type: 'clue'; };
export type DefinitionTransformation = { type: 'definition'; };
export type ReplacementTransformation = { type: 'replacement'; replacement?: string; };
export type Transformation =
    ClueTransformation |
    DefinitionTransformation |
    ReplacementTransformation;
export type TransformationType = Transformation['type'];

export const transform = (node: SolutionTreeNode, transformation: Transformation): SolutionTreeNode => {
    switch (transformation.type) {
        case "clue":
            return { ...node };
        case "definition":
            return { ...node };
        case "replacement":
            const replacementRange = node.ranges.find(r => r.type === "replacement");
            if (!replacementRange) return node;

            const before = node.clue.slice(0, replacementRange.start);
            const after = node.clue.slice(replacementRange.end);
            const newClue = [before, transformation.replacement, after].join('');

            return {
                ...node,
                clue: newClue,
            };
    }
};
