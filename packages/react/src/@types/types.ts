import { Breadboard } from "@google-labs/breadboard";

export type BreadboardContextType = {
	board: Breadboard | null;
}

export type BreadboardProviderProps = {
	children: React.ReactNode;
}