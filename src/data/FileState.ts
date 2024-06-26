import { Location } from "vscode";
import { Range } from "vscode-languageclient";

type Predicate = string;

export interface FileState {
	specs: ISpecification[];
	pos: IProofObligation[];
	warnings: IStructWarning[];
    errors: Error[];
}

export interface ISpecification {
	id: number;
	preCondition: Predicate;
	postCondition: Predicate;
	specRange: Range;
}
export interface IProofObligation {
    assumption: Predicate;
    goal: Predicate;
    hash: string;
    proofLocation?: Range;
    origin: {
        tag: "Abort" | "Skip" | "Spec" | "Assignment" | "Conditional" | "Loop invariant" | "Loop termination";
        location: Location;
        explanation?: string;
    }
}

export interface IStructWarning {
    tag: "MissingBound" | "ExcessBound";
    range: Range;
}
